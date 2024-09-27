export const isDriver = (req, res, next) => {
  if (req.session.user && req.session.user.userType === 'Driver') {
    return next();
  } else {
    if (req.session.user) {
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  }
};

export const isAdmin = (req, res, next) => {
  console.log(req.session.user,"req.session.user")
  if (req.session.user && req.session.user.userType == 'Admin') {
    return next();
  } else {
    if (req.session.user) {
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  }
};
export const isExaminer = (req, res, next) => {
  console.log(req.session.user,"req.session.user")
  if (req.session.user && req.session.user.userType == 'Examiner') {
    return next();
  } else {
    if (req.session.user) {
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  }
};
export const isAuthenticUser = (req, res, next) => {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
};
