import mongoose from 'mongoose';

const appointment_schema = mongoose.Schema({
  appointmentDate: { type: String, required: true },
  appointmentTime: { type: String, required: true },
  isTimeSlotAvailable: { type: Boolean },
});

const appointmentModel = mongoose.model('appointment', appointment_schema);
export default appointmentModel;
