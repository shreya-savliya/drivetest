import mongoose from 'mongoose';
const uri =
  'mongodb+srv://shreyasavaliya2801:Shreya0801@cluster0.ja95ybi.mongodb.net/?retryWrites=true&w=majority';

mongoose
  .connect(uri)
  .then(() => {
    console.log('********** Connected to MongoDB ***********');
  })
  .catch((err) => {
    console.error(err);
  });

const user_schema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  License_No: { type: String, required: true },
  age: { type: Number, required: true },
  appointmentId: { type: String },
  username: { type: String },
  password: { type: String },
  userType: {
    type: String,
    enum: ['Driver', 'Examiner', 'Admin'],
  },
  testType: { type: String },
  isTestG2Pass: { type: Boolean },
  isTestGPass: { type: Boolean },
  isevaluatedDone: { type: Boolean },
  comment: { type: String },
  car_details: {
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    platno: {
      type: String,
      required: true,
    },
  },
});

const userModel = mongoose.model('user_driving_test_data', user_schema);
export default userModel;
