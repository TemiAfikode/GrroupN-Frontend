// state class to hold the current page, feedback index when it get's to the feedback page
class State {
  constructor() {
    if (State.instance) {
      return State.instance;
    }
    State.instance = this;
    this.page = 'landing';
    this.feedbackIndex = 1;
  }
}

const state = new State();

// Component class renders the template to the dom
class Component {
  constructor(
    templateElId,
    hostElId,
    insertFirst,
    elementId = '',
    eventListeners = [],
    innerEl = null
  ) {
    this.getTemplateEl = document.getElementById(templateElId);
    this.hostElement = document.getElementById(hostElId);
    this.state = new State();
    const templateContent = document.importNode(
      this.getTemplateEl.content,
      true
    );

    this.element = templateContent.firstElementChild;

    if (elementId) this.element.id = elementId;

    this.attachElement(insertFirst);

    if (innerEl) innerEl();

    eventListeners.length > 0 &&
      eventListeners.forEach((l) => this.eventListener(l));
  }

  //   Attach the element, the template content into the host
  attachElement(insertFirst = false) {
    this.hostElement.insertAdjacentElement(
      insertFirst ? 'afterbegin' : 'beforeend',
      this.element
    );
  }

  //   Create eventlistener with the eventenser list that's passed into the constructor
  eventListener(action) {
    if (action.multiple) {
      //if the event is among more than one class name
      document.querySelectorAll(action.element).forEach((e) =>
        e.addEventListener(action.event, () => {
          if (action.page !== 'feedback') {
            this.hostElement.removeChild(this.element); //Remove the element from the host before calling the function that's passed through the listener list
          } else {
            if (
              this.state.feedbackIndex === 3 &&
              action.element !== '#left-btn'
            )
              //In order load the las page after collecting feedback, remove the element
              this.hostElement.removeChild(this.element);
          }
          action.exec();
        })
      );
    } else {
      document
        .querySelector(action.element)
        .addEventListener(action.event, () => {
          if (action.page !== 'feedback') {
            this.hostElement.removeChild(this.element);
          } else {
            if (
              this.state.feedbackIndex === 3 &&
              action.element !== '#left-btn'
            )
              this.hostElement.removeChild(this.element);
          }
          action.exec();
        });
    }
  }
}

// render page base on the actve page on the state class
function renderPage() {
  if (state.page === 'landing') {
    //create list of listener object to be passed to component class
    const listeners = [
      {
        element: '.start-btn', //Element to add the listener on, should be selector string
        event: 'click', //the type of eventto be run in the component class
        exec: () => {
          state.page = 'identification'; //change the page state when this function is called
          renderPage(); //call the function again to repaint the dom with the current page state
        },
        multiple: true,
        page: state.page,
      },
    ];
    new Component('landing', 'contents', false, null, listeners);
  } else if (state.page === 'identification') {
    const listeners = [
      {
        element: '.regular',
        event: 'click',
        exec: () => {
          state.page = 'verification';
          renderPage();
        },
        multiple: false,
        page: state.page,
      },
      {
        element: '.first-time',
        event: 'click',
        exec: () => {
          state.page = 'authentication';
          renderPage();
        },
        multiple: false,
        page: state.page,
      },
    ];

    new Component('identity', 'contents', false, null, listeners);
  } else if (state.page === 'verification') {
    authPage('regular');
  } else if (state.page === 'authentication') {
    authPage('authentication');
  } else if (state.page === 'feedback') {
    const listeners = [
      {
        element: '#right-btn',
        event: 'click',
        exec: () => feedbackNextButtonClick(),
        multiple: false,
        page: state.page,
        index: state.feedbackIndex,
      },
      {
        element: '#left-btn',
        event: 'click',
        exec: () => feedbackPrevButtonClick(),
        multiple: false,
        page: state.page,
        index: state.feedbackIndex,
      },
      {
        element: '.emojis > li img',
        event: 'click',
        exec: () => feedbackNextButtonClick(),
        multiple: true,
        page: state.page,
        index: state.feedbackIndex,
      },
    ];
    new Component('feedback', 'contents', false, null, listeners);
  } else if (state.page === 'end') {
    new Component('end', 'contents', false, null);
  }
}

function authPage(page) {
  const listeners = [
    {
      element: '.frame',
      event: 'click',
      exec: () => {
        state.page = 'feedback';
        renderPage();
      },
      multiple: false,
    },
  ];

  //   another handy function to render dynamic content to an element in component
  const innerEl = () => {
    el = document.querySelector('.frame');

    const el1 =
      '<div><span class="material-symbols-rounded icon-svg">verified_user </span> <p>Done. Let’s go...</p><div>';
    const el2 =
      page === 'regular'
        ? '<div><span class="loading"></span><p>Please be patient...</p></div>'
        : '<div><p>Awesome Illustration</p></div>';

    el.innerHTML = el2;

    setTimeout(() => {
      el.removeChild(document.querySelector('.frame > div'));
      el.innerHTML = el1;
    }, 1000);
  };
  new Component(
    page === 'regular' ? 'verification' : 'authentication',
    'contents',
    false,
    null,
    listeners,
    innerEl
  );
}

function feedbackNextButtonClick() {
  state.feedbackIndex = state.feedbackIndex + 1; //increment the feedback indes
  if (state.feedbackIndex === 4) {
    state.page = 'end'; //change the page state when index is at 3
    renderPage(); //render the last page
  }
  const slider = document.querySelector('.slider');
  const prevBtn = document.querySelector('#left-btn');
  const nxtvBtn = document.querySelector('#right-btn');

  const indicator = document.querySelector(
    `.indicator > li:nth-child(${state.feedbackIndex})`
  ); //select the indicator on which the feedback state is currently at

  slider.style.transform = `translateX(-${25 * state.feedbackIndex}%)`; //slide the feedback title and description 25% horizontally

  prevBtn.style.visibility = 'visible';
  indicator.classList.add('done');

  if (state.feedbackIndex === 3) nxtvBtn.style.visibility = 'hidden';
}

function feedbackPrevButtonClick() {
  const slider = document.querySelector('.slider');
  const prevBtn = document.querySelector('#left-btn');
  const nxtvBtn = document.querySelector('#right-btn');
  state.feedbackIndex = state.feedbackIndex - 1;

  const indicator = document.querySelector(
    `.indicator > li:nth-child(${state.feedbackIndex + 1})`
  );
  slider.style.transform = `translateX(-${25 * state.feedbackIndex}%)`;
  indicator.classList.remove('done');
  nxtvBtn.style.visibility = 'visible';

  if (state.feedbackIndex === 1) {
    prevBtn.style.visibility = 'hidden';
  }
}

renderPage();
