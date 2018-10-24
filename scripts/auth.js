'use strict';
{
  /**
   * Sign in form.
   */
  const FORM = document.forms['sign-in'];

  /**
   * Query selector.
   */
  let $ = FORM.querySelector.bind(FORM);

  /**
   * Non-form elements.
   */
  const FORGOT_PASSWORD = $('.forgot-password');
  const MESSAGE         = $('.message');

  /**
   * Sign in.
   */
  function onsubmit(event) {
    let form     = this;
    let email    = form.elements['email'].value;
    let password = form.elements['password'].value;
    let submit   = form.elements['submit'];

    resetValidity(form);

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(onsignin.bind(this))
      .catch(onsigninerror.bind(this));
    submit.disabled = true;
    event.preventDefault();
    return false;
  }

  /**
   * Reset form validity.
   */
  function resetValidity(form) {
    for (let i = 0; i < form.elements.length; i++) {
      form.elements[i].setCustomValidity('');
    }
  }

  /**
   * Redirect to action URI.
   */
  function onsignin() {
    location.href = this.action;
  }

  /**
   * Report sign in error.
   */
  function onsigninerror(error) {
    let form     = this;
    let email    = form.elements['email'];
    let password = form.elements['password'];
    let submit   = form.elements['submit'];
    let target   = email;
    switch (error.code) {
      case 'auth/wrong-password':
        target = password;
        break;
    }
    target.setCustomValidity(error.message);
    form.reportValidity();
    submit.disabled = false;
  }

  FORM.addEventListener('submit', onsubmit);

  /**
   * Reset input validity.
   */
  function oninput(event) {
    this.setCustomValidity('');
  }

  let email    = FORM.elements['email'];
  let password = FORM.elements['password'];
  email.addEventListener('input', oninput);
  password.addEventListener('input', oninput);

  /**
   * Create account.
   */
  function oncreateaccount(event) {
    let form     = FORM;
    let email    = form.elements['email'];
    let password = form.elements['password'];

    resetValidity(form);

    if (!email.checkValidity() || !password.checkValidity()) {
      form.reportValidity();
      event.preventDefault();
      return false;
    }

    firebase
      .auth()
      .createUserWithEmailAndPassword(email.value, password.value)
      .then(oncreateuser.bind(form))
      .catch(oncreateusererror.bind(form));
    event.preventDefault();

    let button      = form.elements['create-account'];
    button.disabled = true;

    return false;
  }

  /**
   * Send email verification.
   */
  function oncreateuser(user) {
    user
      .sendEmailVerification()
      .then(onsendemailverification);
  }

  /**
   * Display send email verification success message.
   */
  function onsendemailverification() {
    FORGOT_PASSWORD.hidden = true;
    MESSAGE.textContent    = 'Email verification sent.';
  }

  /**
   * Report create user error.
   */
  function oncreateusererror(error) {
    let form     = this;
    let email    = form.elements['email'];
    let password = form.elements['password'];
    let button   = form.elements['create-account'];
    let target   = email;
    switch (error.code) {
      case 'auth/weak-password':
        target = password;
        break;
    }
    target.setCustomValidity(error.message);
    form.reportValidity();
    button.disabled = false;
  }

  let createAccount = FORM.elements['create-account'];
  createAccount.addEventListener('click', oncreateaccount);

  /**
   * Send password reset email.
   */
  function onforgotpassword(event) {
    let form  = FORM;
    let email = form.elements['email'];

    resetValidity(form);

    if (!email.checkValidity()) {
      form.reportValidity();
      event.preventDefault();
      return false;
    }

    firebase
      .auth()
      .sendPasswordResetEmail(email.value)
      .then(onsendpasswordresetemail.bind(form))
      .catch(onsendpasswordresetemailerror.bind(form));
    event.preventDefault();

    FORGOT_PASSWORD.style.pointerEvents = 'none';

    return false;
  }

  /**
   * Display send password reset email success message.
   */
  function onsendpasswordresetemail() {
    FORGOT_PASSWORD.hidden = true;
    MESSAGE.textContent    = 'Password reset email sent.';
  }

  /**
   * Report send password reset email error.
   */
  function onsendpasswordresetemailerror(error) {
    let form  = this;
    let email = form.elements['email'];
    email.setCustomValidity(error.message);
    form.reportValidity();

    FORGOT_PASSWORD.style.pointerEvents = '';
  }

  FORGOT_PASSWORD.addEventListener('click', onforgotpassword);

  /**
   * Currently signed in.
   */
  firebase
    .auth()
    .onAuthStateChanged((user) => {
      if (user && user.emailVerified) onsignin.call(form);
    });
};
