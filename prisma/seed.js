const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create a system admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@togohealthcare.com',
      password: hashedPassword,
      role: 'SYSTEM_ADMIN',
    },
  });
  
  console.log('Created admin user:', admin);

  // Create a clinic
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Togo Central Hospital',
      address: '123 Health Street',
      city: 'Lomé',
      country: 'Togo',
      postalCode: '10001',
      phoneNumber: '+228 12345678',
      email: 'contact@togocentralhospital.com',
      description: 'The main healthcare facility in Lomé, offering comprehensive medical services.',
    },
  });
  
  console.log('Created clinic:', clinic);

  // Create a doctor user
  const doctorPassword = await bcrypt.hash('Doctor123!', 10);
  
  const doctorUser = await prisma.user.create({
    data: {
      name: 'Dr. Kofi Mensah',
      email: 'dr.kofi@togohealthcare.com',
      password: doctorPassword,
      role: 'DOCTOR',
      doctor: {
        create: {
          specialization: 'General Medicine',
          licenseNumber: 'TOG-MED-2023-001',
          yearsOfExperience: 10,
          education: 'University of Lomé Medical School',
          biography: 'Experienced general practitioner with focus on preventive care.',
          consultationFee: 50.0,
          availableFrom: '09:00',
          availableTo: '17:00',
          availableDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        }
      }
    },
    include: {
      doctor: true,
    }
  });
  
  console.log('Created doctor user:', doctorUser);

  // Create a patient user
  const patientPassword = await bcrypt.hash('Patient123!', 10);
  
  const patientUser = await prisma.user.create({
    data: {
      name: 'Ama Koffi',
      email: 'ama@example.com',
      password: patientPassword,
      role: 'PATIENT',
      patient: {
        create: {
          dateOfBirth: new Date('1990-05-15'),
          gender: 'Female',
          phoneNumber: '+228 98765432',
          address: '456 Patient Road, Lomé',
          emergencyContact: '+228 55544433',
          pinCode: await bcrypt.hash('1234', 10), // Simple PIN for medical record access
          bloodType: 'O+',
        }
      }
    },
    include: {
      patient: true,
    }
  });
  
  console.log('Created patient user:', patientUser);

  // Connect doctor to clinic
  const clinicDoctor = await prisma.clinicDoctor.create({
    data: {
      clinicId: clinic.id,
      doctorId: doctorUser.doctor.id,
      status: 'ACTIVE',
    }
  });
  
  console.log('Connected doctor to clinic:', clinicDoctor);

  // Connect patient to clinic
  const clinicPatient = await prisma.clinicPatient.create({
    data: {
      clinicId: clinic.id,
      patientId: patientUser.patient.id,
      status: 'ACTIVE',
    }
  });
  
  console.log('Connected patient to clinic:', clinicPatient);

  // Create a medical record
  const medicalRecord = await prisma.medicalRecord.create({
    data: {
      patientId: patientUser.patient.id,
      doctorId: doctorUser.doctor.id,
      title: 'Initial Consultation',
      description: 'Patient came in for a routine check-up. Vitals are normal.',
      date: new Date(),
      type: 'CONSULTATION',
      isApproved: true,
    }
  });
  
  console.log('Created medical record:', medicalRecord);

  // Create an appointment
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const appointment = await prisma.appointment.create({
    data: {
      patientId: patientUser.patient.id,
      doctorId: doctorUser.doctor.id,
      date: tomorrow,
      startTime: '10:00',
      endTime: '10:30',
      status: 'SCHEDULED',
      type: 'IN_PERSON',
      notes: 'Follow-up appointment',
    }
  });
  
  console.log('Created appointment:', appointment);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
