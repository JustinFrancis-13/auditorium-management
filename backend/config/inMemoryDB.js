const bcrypt = require('bcryptjs');

let users = [];
let auditoriums = [];
let bookings = [];
let events = [];
let initialized = false;

const initDemoData = async () => {
  if (initialized) return;
  initialized = true;
  const adminPass = await bcrypt.hash('admin123', 12);
  const facultyPass = await bcrypt.hash('faculty123', 12);
  const studentPass = await bcrypt.hash('student123', 12);

  users.push(
    { _id: '1', name: 'Admin User', email: 'admin@anurag.edu.in', password: adminPass, role: 'admin', department: 'Administration', employeeId: 'AU-ADMIN-001', phone: '9876543210', isActive: true, createdAt: new Date() },
    { _id: '2', name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@anurag.edu.in', password: facultyPass, role: 'faculty', department: 'Computer Science', employeeId: 'AU-FAC-101', phone: '9876543211', isActive: true, createdAt: new Date() },
    { _id: '3', name: 'Priya Sharma', email: 'priya.sharma@anurag.edu.in', password: studentPass, role: 'student', department: 'Electronics', employeeId: 'AU-STU-2021001', phone: '9876543212', isActive: true, createdAt: new Date() },
    { _id: '4', name: 'Event Coordinator', email: 'events@anurag.edu.in', password: facultyPass, role: 'staff', department: 'Student Affairs', employeeId: 'AU-STF-201', phone: '9876543213', isActive: true, createdAt: new Date() }
  );

  auditoriums.push(
    { _id: 'a1', name: 'Anurag Main Auditorium', code: 'AU-MAIN', description: 'Premier auditorium with state-of-the-art facilities for 1200 guests', location: 'Block A, Ground Floor', capacity: 1200, vipCapacity: 100, amenities: ['projector', 'microphone', 'ac', 'wifi', 'livestream', 'recording', 'greenroom', 'parking', 'wheelchair'], status: 'active', pricePerHour: 5000, rules: 'No food inside. Formal attire for official events.', managerContact: '040-23042222', createdAt: new Date() },
    { _id: 'a2', name: 'Seminar Hall - Block B', code: 'AU-SEM-B', description: 'Medium-sized hall ideal for departmental events and guest lectures', location: 'Block B, First Floor', capacity: 300, vipCapacity: 30, amenities: ['projector', 'microphone', 'ac', 'wifi'], status: 'active', pricePerHour: 1500, rules: 'Maximum 300 persons allowed.', managerContact: '040-23042223', createdAt: new Date() },
    { _id: 'a3', name: 'Mini Theatre - Tech Hub', code: 'AU-MINI-TH', description: 'Modern mini theatre for technical presentations', location: 'Tech Hub, Second Floor', capacity: 150, vipCapacity: 0, amenities: ['projector', 'microphone', 'ac', 'wifi', 'recording'], status: 'active', pricePerHour: 800, rules: 'Technical events only.', managerContact: '040-23042224', createdAt: new Date() },
    { _id: 'a4', name: 'Open Air Amphitheatre', code: 'AU-OAT', description: 'Open-air venue for cultural events and large gatherings', location: 'Central Campus, Near Cafeteria', capacity: 2000, vipCapacity: 200, amenities: ['microphone', 'parking', 'wheelchair'], status: 'active', pricePerHour: 3000, rules: 'Weather dependent. No permanent structures.', managerContact: '040-23042225', createdAt: new Date() }
  );

  bookings.push(
    { _id: 'b1', bookingId: 'AU-DEMO001', auditorium: 'a1', requestedBy: '2', eventName: 'Annual Tech Fest 2024', eventType: 'technical', description: 'Annual tech festival showcasing student innovation', startDateTime: new Date(Date.now() + 86400000 * 3), endDateTime: new Date(Date.now() + 86400000 * 3 + 28800000), expectedAttendees: 800, department: 'Computer Science', status: 'approved', approvedBy: '1', requirements: { projector: true, microphone: true, livestream: true }, totalCost: 40000, isPaid: true, createdAt: new Date() },
    { _id: 'b2', bookingId: 'AU-DEMO002', auditorium: 'a2', requestedBy: '3', eventName: 'Electronics Symposium', eventType: 'seminar', description: 'Guest lecture series on IoT and Embedded Systems', startDateTime: new Date(Date.now() + 86400000 * 7), endDateTime: new Date(Date.now() + 86400000 * 7 + 14400000), expectedAttendees: 200, department: 'Electronics', status: 'pending', requirements: { projector: true, microphone: true }, totalCost: 6000, isPaid: false, createdAt: new Date() },
    { _id: 'b3', bookingId: 'AU-DEMO003', auditorium: 'a4', requestedBy: '4', eventName: 'Cultural Night 2024', eventType: 'cultural', description: 'Annual cultural festival with music and dance', startDateTime: new Date(Date.now() + 86400000 * 14), endDateTime: new Date(Date.now() + 86400000 * 14 + 18000000), expectedAttendees: 1500, department: 'Student Affairs', status: 'approved', approvedBy: '1', requirements: { microphone: true }, totalCost: 15000, isPaid: false, createdAt: new Date() },
    { _id: 'b4', bookingId: 'AU-DEMO004', auditorium: 'a3', requestedBy: '2', eventName: 'ML Workshop', eventType: 'workshop', description: 'Hands-on workshop on Machine Learning', startDateTime: new Date(Date.now() - 86400000 * 5), endDateTime: new Date(Date.now() - 86400000 * 5 + 21600000), expectedAttendees: 100, department: 'Computer Science', status: 'completed', approvedBy: '1', requirements: { projector: true, recording: true }, totalCost: 4800, isPaid: true, createdAt: new Date(Date.now() - 86400000 * 10) }
  );

  events.push(
    { _id: 'e1', booking: 'b1', title: 'Annual Tech Fest 2024', description: 'Innovation showcase featuring student projects and competitions', startDateTime: new Date(Date.now() + 86400000 * 3), endDateTime: new Date(Date.now() + 86400000 * 3 + 28800000), auditorium: 'a1', organizer: '2', isPublic: true, registrationRequired: true, maxRegistrations: 800, registrations: [], tags: ['technology', 'innovation'], status: 'upcoming', createdAt: new Date() },
    { _id: 'e2', booking: 'b3', title: 'Cultural Night 2024', description: 'An evening of art, music and dance performances', startDateTime: new Date(Date.now() + 86400000 * 14), endDateTime: new Date(Date.now() + 86400000 * 14 + 18000000), auditorium: 'a4', organizer: '4', isPublic: true, registrationRequired: false, tags: ['culture', 'music', 'dance'], status: 'upcoming', createdAt: new Date() }
  );
};

initDemoData();

module.exports = { users, auditoriums, bookings, events };
