import appointment from '../models/appointmentModel.js';
function generateHalfHourSlots() {
  const startTime = '09:00';
  const slots = [];
  let [currentHour, currentMinute] = startTime.split(':').map(Number);

  while (currentHour < 18 || (currentHour === 18 && currentMinute === 0)) {
    const timeString = `${currentHour
      .toString()
      .padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    slots.push(timeString);
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentMinute -= 60;
      currentHour++;
    }
  }
  return slots;
}
class AppointmentController {
  static appointment = async (req, res) => {
    res.render('appointment.ejs', {
      slots: generateHalfHourSlots(),
      user: req.session.user,
      msg: req.session.msg,
    });
  };

  static getSlots = async (req, res) => {
    const selectedDate = req.query.date;

    try {
      const appointments = await appointment.find({
        appointmentDate: selectedDate,
        isTimeSlotAvailable: true,
      });
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching slots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  static appointment_post = async (req, res) => {
    const { appointmentDate, time } = req.body;
    const addAppointmentSlotToDB = new appointment({
      appointmentDate,
      appointmentTime: time,
      isTimeSlotAvailable: true,
    });
    let appointmentFound = await appointment.findOne({
      appointmentDate,
      appointmentTime: time,
    });
    console.log(appointmentFound, 'appointmentFound');
    // Save user to database
    if (appointmentFound === null) {
      const slot_saved = await addAppointmentSlotToDB.save();
      req.session.msg = 'Appointment is sucessfully added';
    } else {
      req.session.msg = 'Appointment is already exit';
    }
    // delete req.session.msg;
    res.redirect('/appointment');
  };
}

export default AppointmentController;
