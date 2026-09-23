
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Task = require('../models/Task');

const run = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([User.deleteMany(), Customer.deleteMany(), Lead.deleteMany(), Task.deleteMany()]);

  const admin = await User.create({
    name: 'Nithisha',
    email: 'admin@nexaconnect.com',
    password: 'Admin@123',
    role: 'admin',
    designation: 'CRM Administrator',
  });

  const employee = await User.create({
    name: 'Venisha',
    email: 'employee@nexaconnect.com',
    password: 'Employee@123',
    role: 'employee',
    designation: 'Sales Executive',
  });

  const customers = await Customer.insertMany(
    [
      { name: 'Kanishkaa', email: 'Kanishkaa@brightsoft.com', company: 'BrightSoft Pvt Ltd', phone: '+91 98765 43210', status: 'active', source: 'website', city: 'Chennai', country: 'India' },
      { name: 'Hashini', email: 'Hashini@orbitgear.com', company: 'OrbitGear Inc', phone: '+1 415 555 0132', status: 'active', source: 'referral', city: 'San Francisco', country: 'USA' },
      { name: 'Bhava', email: 'Bhava@sakuratech.jp', company: 'Sakura Tech', phone: '+81 90 1234 5678', status: 'active', source: 'social', city: 'Tokyo', country: 'Japan' },
      { name: 'Sherin', email: 'Sherin@greenfields.ie', company: 'Greenfields Co', phone: '+353 87 123 4567', status: 'inactive', source: 'ads', city: 'Dublin', country: 'Ireland' },
    ].map((c) => ({ ...c, createdBy: admin._id, assignedTo: employee._id }))
  );

  const statuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
  const leadDocs = customers.flatMap((c, i) => [
    {
      title: `${c.company} - Software License Deal`,
      customer: c._id,
      contactName: c.name,
      contactEmail: c.email,
      company: c.company,
      value: 5000 + i * 2500,
      status: statuses[i % statuses.length],
      priority: ['low', 'medium', 'high'][i % 3],
      createdBy: admin._id,
      assignedTo: employee._id,
      position: 0,
    },
  ]);
  await Lead.insertMany(leadDocs);

  await Task.insertMany([
    { title: 'Follow up with Kanishkaa', priority: 'high', status: 'pending', assignedTo: employee._id, createdBy: admin._id, dueDate: new Date(Date.now() + 2 * 86400000) },
    { title: 'Prepare proposal for OrbitGear', priority: 'medium', status: 'in-progress', assignedTo: employee._id, createdBy: admin._id, dueDate: new Date(Date.now() + 5 * 86400000) },
    { title: 'Send welcome email to Sakura Tech', priority: 'low', status: 'completed', assignedTo: employee._id, createdBy: admin._id, completedAt: new Date() },
  ]);

  console.log('✅ Seed complete!');
  console.log('   Admin login:    admin@nexaconnect.com / Admin@123');
  console.log('   Employee login: employee@nexaconnect.com / Employee@123');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
