import user from '../models/userModel.js';
import appointment from '../models/appointmentModel.js';

export const defaultValues = {
  firstName: 'default',
  lastName: 'default',
  License_No: 'default',
  age: 0,
  dob: 'default',
  car_details: {
    make: 'default',
    model: 'default',
    year: 0,
    platno: 'default',
  },
};

function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

class Controller {
  static dashboard(req, res) {
    res.render('dashboard.ejs', { user: req.session.user });
  }

  static gtest = async (req, res) => {
    await Controller.handleTestData(req, res, 'gtest.ejs');
  };

  static g2test = async (req, res) => {
    const user_from_db = await user.findOne({
      username: req.session.user_id,
    });

    await Controller.handleTestData(req, res, 'g2test.ejs');
  };

  static handleTestData = async (req, res, template) => {
    try {
      if (!req.session.user) {
        return res.redirect('/login');
      }

      const loggedUser = req.session.user;
      let userData = await user.findOne({
        username: loggedUser.username,
      });
      if (!userData) {
        userData = await user.findOne({
          _id: req.session.user_id,
        });
      }

      const availableSlots = await appointment.find({
        appointmentDate: getCurrentDate(),
      });

      const isDefaultData = await Controller.isDefaultUserData(userData);

      res.render(template, {
        userData,
        isDefaultData,
        user: req.session.user,
        slots: availableSlots,
        getCurrentDate,
        myMsg: req.session.msg,
      });
    } catch (err) {
      console.log(err);
    }
  };

  static isDefaultUserData = async (userData) => {
    for (const key in defaultValues) {
      if (typeof userData[key] === 'object') {
        for (const nestedKey in defaultValues[key]) {
          if (userData[key][nestedKey] !== defaultValues[key][nestedKey]) {
            return false;
          }
        }
      } else {
        if (userData[key] !== defaultValues[key]) {
          return false;
        }
      }
    }

    return true;
  };

  static g_post = async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        licenseNumber,
        age,
        dob,
        make,
        model,
        year,
        platno,
        appointmentDate,
        time,
      } = req.body;
      // Fetching the user from the database
      const user_from_db = await user.findOne({ _id: req.session.user._id });

      // If user is found
      if (user_from_db) {
        let allowUpdate = true;

        // Check if testType attribute already exists and its value is 'G2'
        if (user_from_db.testType === 'G2') {
          // Check if isTestG2Pass is true, if not, disallow update
          if (!user_from_db.isTestG2Pass) {
            allowUpdate = false;
          }
        } else if (user_from_db.testType === 'G') {
          // Check if isTestGPass is true, if true, disallow update
          if (user_from_db.isTestGPass) {
            allowUpdate = false;
          }
        }

        // If updating is allowed, update the user
        if (allowUpdate) {
          const findAppointmentSlotFromDB = await appointment.findOneAndUpdate(
            {
              appointmentDate,
              appointmentTime: time,
            },
            { isTimeSlotAvailable: false }
          );
          console.log(findAppointmentSlotFromDB,"findAppointmentSlotFromDB")
          await user.findOneAndUpdate(
            { _id: req.session.user._id },
            {
              firstName,
              lastName,
              License_No: licenseNumber,
              age,
              dob,
              appointmentId: findAppointmentSlotFromDB._id,
              testType: 'G',
              car_details: {
                make,
                model,
                year,
                platno,
              },
            }
          );
          req.session.msg = 'G Test Book Sucessfully';
          res.redirect('/g');
          // res.render('gtest.ejs', {
          //   userData: user_from_db,
          //   errorMessage: null,
          //   user: req.session.user,
          // });
        } else {
          // If updating is not allowed, send error 
          req.session.msg = 'You have already book the G Test or you have not cleared the G2 Test.';
          res.redirect('/g');
          // res.render('gtest.ejs', {
          //   userData: user_from_db,
          //   errorMessage: null,
          //   user: req.session.user,
          // });
        }
      } else {
        // If user is not found, send error message
        console.error('User not found.');
        res.status(404).send('User not found.');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };



  static g2_post = async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        licenseNumber,
        age,
        dob,
        make,
        model,
        year,
        platno,
        appointmentDate,
        time,
      } = req.body;

      const findAppointmentSlotFromDB = await appointment.findOneAndUpdate(
        {
          appointmentDate,
          appointmentTime: time,
        },
        { isTimeSlotAvailable: false }
      );
      const userToUpdate = await user.findOneAndUpdate(
        { _id: req.session.user._id },
        {
          firstName,
          lastName,
          License_No: licenseNumber,
          age,
          dob,
          appointmentId: findAppointmentSlotFromDB._id,
          testType: 'G2',
          car_details: {
            make,
            model,
            year,
            platno,
          },
        }
      );
      req.session.msg = 'G2 Test Book Sucessfully.';
      res.redirect('/g2');
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  };
}
export default Controller;
