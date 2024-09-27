import Controller from '../controller/userController.js';
import AppointmentController from '../controller/appointmentController.js';
import AuthenticateController from '../controller/AuthenticateController.js';
import ExamController from '../controller/examController.js';
import express from 'express';
import {
  isDriver,
  isAdmin,
  isAuthenticUser,
  isExaminer,
} from '../middleware/authenticate.js';

import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';
const router = express.Router();

router.get('/', Controller.dashboard);

router.get('/g', isDriver, Controller.gtest);

router.post('/g', isDriver, Controller.g_post);

router.get('/g2', isDriver, Controller.g2test);

router.post('/g2', isDriver, Controller.g2_post);

router.get('/appointment', isAdmin, AppointmentController.appointment);

router.post('/appointment', isAdmin, AppointmentController.appointment_post);

router.get('/exam', isExaminer, ExamController.examiner);

router.post('/exam', isExaminer, ExamController.examiner_post);

router.get('/get-slots', AppointmentController.getSlots);

router.get('/login', AuthenticateController.login);

router.post('/signup', AuthenticateController.signup_post);

router.post('/login', AuthenticateController.login_post);

router.get('/', isAuthenticUser, Controller.dashboard);

router.get('/logout', AuthenticateController.logout);

// Assuming the Appointment model is imported as Appointment and User model as User

// Route to fetch drivers with upcoming appointments
router.get('/examiner/drivers', isExaminer, async (req, res) => {
  try {
    // Extract test type filter from query parameters
    const testType = req.query.testType;

    // Find users who are drivers and have an appointment ID
    let driversWithAppointments;
    if (testType && (testType === 'G2' || testType === 'G')) {
      // If test type is specified, filter by test type
      driversWithAppointments = await User.find({
        userType: 'Driver',
        appointmentId: { $ne: null }, // Filter out users without appointment IDs
        testType: testType, // Filter by the specified test type
      });
    } else {
      // If no test type specified, retrieve all drivers with appointments
      driversWithAppointments = await User.find({
        userType: 'Driver',
        appointmentId: { $ne: null }, // Filter out users without appointment IDs
      });
    }

    // Check if there are any drivers available
    if (driversWithAppointments.length === 0) {
      return res.render('examiner.ejs', {
        message: `No one currently scheduled for the ${
          testType ? testType : 'G2 or G'
        } test.`,
        drivers: [],
      });
    }

    // Extract appointment IDs from the drivers
    const appointmentIds = driversWithAppointments.map(
      (driver) => driver.appointmentId
    );

    // Fetch upcoming appointments based on the appointment IDs
    const currentDate = new Date();
    const upcomingAppointments = await Appointment.find({
      _id: { $in: appointmentIds },
      appointmentDate: { $gte: '2024-04-12' }, // Filter appointments after the current date
    });

    // Extract drivers associated with these appointments
    const drivers = driversWithAppointments.filter((driver) =>
      upcomingAppointments.some(
        (appointment) => appointment._id.toString() === driver.appointmentId
      )
    );

    res.render('examiner.ejs', {
      drivers,
      message: null,
      user: req.session.user,
      testType
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/examiner/comment/:driverId', (req, res) => {
  // Render the evaluation form template
  res.render('evaluationForm.ejs', {
    driverId: req.params.driverId,
    user: req.session.user,
  });
});

// POST route to handle form submission
router.post('/examiner/comment/:driverId', async (req, res) => {
  const driverId = req.params.driverId;
  const comment = req.body.comment; // Assuming the comment is submitted through a form field named 'comment'
  const result = req.body.result;
  try {
    // Find the user by driverId
    const user = await User.findById(driverId);

    if (!user) {
      return res.status(404).json({ message: 'Driver not found' });
    }

      // Update user with comment and test result
      user.comment = comment;
      user.isTestG2Pass = result === 'pass' && user.testType === 'G2';
      user.isTestGPass = result === 'pass' && user.testType === 'G';

      // Set isevaluatedDone to true
      user.isevaluatedDone = true;


    // Save the updated user
    await user.save();

    // Redirect back to the drivers list or any other appropriate page
    res.redirect('/examiner/drivers');
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/driversEvaluation', isAdmin, async (req, res) => {
  try {
    // Find candidates who passed or failed the test
    const passCandidates = await User.find({
      $or: [{ isTestG2Pass: true }, { isTestGPass: true }],
    });
    const failCandidates = await User.find({
      $and: [{ isTestG2Pass: false }, { isTestGPass: false }],
    });

    res.render('driversEvaluation.ejs', {
      passCandidates,
      failCandidates,
      user: req.session.user,
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.post('/driversEvaluation', async (req, res) => {});
export default router;
