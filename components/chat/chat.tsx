"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, PaperclipIcon, Smile, MoreVertical } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { getInitials } from "@/lib/utils"
import { useSocket } from "@/hooks/use-socket"
import type { Message, ChatContact } from "@/lib/types"

interface ChatProps {
  initialContacts: ChatContact[]
  initialMessages: Record<string, Message[]>
  activeContactId?: string
}

export function Chat({ initialContacts, initialMessages, activeContactId }: ChatProps) {
  const [contacts, setContacts] = useState<ChatContact[]>(initialContacts)
  const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages)
  const [activeContact, setActiveContact] = useState<ChatContact | null>(
    activeContactId ? contacts.find((c) => c.id === activeContactId) || null : null,
  )
  const [messageInput, setMessageInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const socket = useSocket()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, activeContact])

  // Socket connection for real-time messaging
  useEffect(() => {
    if (!socket) return

    // Listen for new messages
    socket.on("new_message", (message: Message) => {
      setMessages((prev) => {
        const contactId = message.senderId === session?.user?.id ? message.receiverId : message.senderId
        return {
          ...prev,
          [contactId]: [...(prev[contactId] || []), message],
        }
      })

      // Update contact's last message
      setContacts((prev) =>
        prev.map((contact) => {
          if (contact.id === (message.senderId === session?.user?.id ? message.receiverId : message.senderId)) {
            return {
              ...contact,
              lastMessage: message.content,
              lastMessageTime: new Date().toISOString(),
            }
          }
          return contact
        }),
      )
    })

    // Clean up on unmount
    return () => {
      socket.off("new_message")
    }
  }, [socket, session])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeContact || !session?.user?.id) return

    setIsLoading(true)
    const newMessage = {
      id: `temp-${Date.now()}`,
      senderId: session.user.id,
      receiverId: activeContact.id,
      content: messageInput,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Optimistically update UI
    setMessages((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMessage],
    }))
    setMessageInput("")

    try {
      // Send message to server
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: activeContact.id,
          content: messageInput,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // Update contacts list with new last message
      setContacts((prev) =>
        prev.map((contact) => {
          if (contact.id === activeContact.id) {
            return {
              ...contact,
              lastMessage: messageInput,
              lastMessageTime: new Date().toISOString(),
            }
          }
          return contact
        }),
      )

      // Socket will handle real-time updates
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      })

      // Remove the optimistic message
      setMessages((prev) => ({
        ...prev,
        [activeContact.id]: prev[activeContact.id].filter((m) => m.id !== newMessage.id),
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectContact = (contact: ChatContact) => {
    setActiveContact(contact)

    // Mark messages as read
    if (messages[contact.id]?.some((m) => !m.isRead && m.senderId === contact.id)) {
      fetch(`/api/messages/read?senderId=${contact.id}`, { method: "PUT" })
        .then(() => {
          setMessages((prev) => ({
            ...prev,
            [contact.id]: prev[contact.id].map((m) => ({
              ...m,
              isRead: true,
            })),
          }))
        })
        .catch(console.error)
    }
  }

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader className="px-0 pt-0">
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="messages" className="flex-1">
              Messages
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex-1">
              Contacts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <div className="flex flex-1 overflow-hidden">
        {/* Contacts sidebar */}
        <div className="w-1/3 border-r">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-1">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted ${
                    activeContact?.id === contact.id ? "bg-muted" : ""
                  }`}
                  onClick={() => handleSelectContact(contact)}
                >
                  <Avatar>
                    <AvatarImage src={contact.image || ""} />
                    <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">{contact.name}</p>
                      {contact.lastMessageTime && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(contact.lastMessageTime), { addSuffix: true, locale: fr })}
                        </span>
                      )}
                    </div>
                    {contact.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                    )}
                    {!contact.isRead && contact.lastMessage && (
                      <div className="w-2 h-2 bg-primary rounded-full absolute right-3"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {activeContact ? (
            <>
              {/* Chat header */}
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={activeContact.image || ""} />
                    <AvatarFallback>{getInitials(activeContact.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{activeContact.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {activeContact.role === "DOCTOR" ? "Médecin" : "Patient"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages[activeContact.id]?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === session?.user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.senderId === session?.user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 text-right mt-1">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message input */}
              <div className="p-3 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <PaperclipIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Écrivez votre message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button variant="ghost" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="font-medium">Aucune conversation sélectionnée</h3>
                <p className="text-sm text-muted-foreground">Sélectionnez un contact pour commencer à discuter</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
