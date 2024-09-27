import user from '../models/userModel.js';
import bcrypt from 'bcrypt';
import Controller, { defaultValues } from './userController.js';
class AuthenticateController {
  static login(req, res) {
    res.render('login.ejs', { user: req.session.user });
  }

  static signup_post = async (req, res) => {
    try {
      const { username, password, confirmPassword, userType } = req.body;
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      // Encrypt password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUserData = new user({
        ...defaultValues,
        username,
        password: hashedPassword,
        userType,
      });

      // Save user to database
      const user_saved = await newUserData.save();

      const isDefaultData = Controller.isDefaultUserData(user_saved);

      console.log('User object:', newUserData);
      req.session.username = req.body.username;
      req.session.save();
      console.log(req.session, req.session.username, req.session.userType);

      if (isDefaultData) {
        return res.redirect('/g2');
      }

      res.redirect('/g');
    } catch (error) {
      console.error(error);
      res.send(error);
    }
  };

  static login_post = async (req, res) => {
    try {
      const { username, password } = req.body;

      // Check if the user exists
      let userFound = await user.findOne({ username: username });
      if (!userFound) {
        console.log('not found');
        return res.redirect('/login');
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(
        password,
        userFound.password
      );

      if (!isPasswordValid) {
        console.log('password not match');
        return res.redirect('/login');
      }

      req.session.user = userFound;
      req.session.save();

      req.session.user_id = userFound._id;
      req.session.user_UserType = userFound.userType;

      res.redirect('/');
    } catch (err) {
      console.log(`Error during login: ${err}`);
      res.status(500).send('Internal Server Error');
    }
  };

  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.log(`Error destroying session: ${err}`);
      } else {
        res.redirect('/login');
      }
    });
  }
}

export default AuthenticateController;
