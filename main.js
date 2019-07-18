
// Global variables
var qualities = ['Swill','Plausible','Genius'];
var ideas = [];
const titleInput = document.querySelector('.input--title');
const bodyInput = document.querySelector('.textarea--body');
const saveButton = document.querySelector('.button--save-idea')
const main = document.querySelector('main');
const cardHolder = document.querySelector('.section--display-ideas');
const editModal = document.querySelector('.div--modal-popup');
const modal = document.querySelector('.div--modal');
// Event Listeners
window.addEventListener('load', repopulateCards);
window.addEventListener('click', hideModal);
document.addEventListener('keypress', hideModal);
main.addEventListener('keyup', createIdeaHandler);
main.addEventListener('click', createIdeaHandler);
cardHolder.addEventListener('click', manageCardHandler);
cardHolder.addEventListener('click', displayModal);


// Functions
function repopulateCards(event) {
  instantiatePersistedIdeas();
  rebuildPersistedIdeas();
  toggleNoIdeasDisplay();
}

function toggleNoIdeasDisplay() {
  var localArray = localStorage.getItem('ideaArray');
  if(localArray === "[]") {
    addNoIdeasDisplay();
  } else {
    removeNoIdeasDisplay();
  }    
}

function addNoIdeasDisplay() {
  cardHolder.insertAdjacentHTML('afterbegin',`
    <p id="section--no-ideas">To add an idea fill out the form above!</p>
    <img id="lightbulb-img" src="images/lightbulb-idea.svg" alt="lightbulb image">
  `);
}

function removeNoIdeasDisplay() {
  var noIdeas = document.getElementById('section--no-ideas');
  var lightbulbImg = document.getElementById('lightbulb-img');

  if(noIdeas === null || lightbulbImg === null) {
    return;
  } else {
    noIdeas.remove();
    lightbulbImg.remove();
  }
}

function instantiatePersistedIdeas() {
  ideasTemp = JSON.parse(localStorage.getItem('ideaArray'));
  ideasTemp.forEach(function(element) {
    element = new Idea(element);
    ideas.push(element);
  })
}

function rebuildPersistedIdeas() {
  if (ideas !== null) {
    ideas.forEach(function(element) {
    buildCard(element)
    });
  }
}

function createIdeaHandler(event) {
  event.preventDefault();
  if (event.target === titleInput || bodyInput) {
    if (checkFields([titleInput, bodyInput])) {
      enableButton(saveButton);
    } else {
      disableButton(saveButton);
    }
  }
  if (event.target.classList.contains('button--save-idea')) {
    populateNewIdea();
  }
}

function populateNewIdea() {
  var idea = new Idea({id: Date.now(), title: titleInput.value, body: bodyInput.value});
  ideas = idea.saveToStorage(ideas);
  buildCard(idea);
  clearFields([titleInput, bodyInput]);
  toggleNoIdeasDisplay();
}

function buildCard(idea) {
  var starImage = idea.star === true ? 'images/star-active.svg' : 'images/star.svg';
  cardHolder.insertAdjacentHTML('afterbegin', `
    <section class="section section--idea-card" data-id="${idea.id}">
      <article class="article article--idea-header">
        <img id="img img--star-icon" src=${starImage} alt="star icon">
        <img id="img img--delete-icon" src="images/delete.svg" alt="delete icon">
      </article>
      <article class="article article--idea-content">
        <h3 class="h3 h3--idea-header">${idea.title}</h3>
        <p class="p p--idea-body">${idea.body}</p>
      </article>
      <article class="article article--idea-footer">
        <img src="images/upvote.svg" alt="upvote icon" data-direction='up' id="img-quality">
        <p class="p--quality">Quality: ${qualities[idea.quality]}</p>
        <img src="images/downvote.svg" alt="downvote icon" data-direction='down' id="img-quality">
      </article>
    </section>`
  )
}

function manageCardHandler(event) {
  event.preventDefault();
  if (event.target.id === 'img img--delete-icon') {
    deleteIdea(event);
  }
  if (event.target.id === 'img img--star-icon') {
    toggleStar(event);
  }
  if (event.target.id === 'img-quality') {
    changeQuality(event);
  }
}

function deleteIdea(event) {
  var card = event.target.parentNode.parentNode;
  cardHolder.removeChild(card);
  var ideaIndex = locateIdea(card);
  ideas = ideaIndex.deleteFromStorage(ideas);
  toggleNoIdeasDisplay();
}

function locateIdea(card) {
  var index = ideas.findIndex(function(element) {
    return element.id == card.dataset.id
  });
  return ideas[index];
}

function editCard(event) {
	// locateIdea(card); isn't firing here.
	editModal.insertAdjacentHTML('afterbegin', `
    <section class="section section--idea-card" data-id="1563336219774">
      <article class="article article--idea-header">
        <img id="img img--star-icon" src= alt="star icon">
        <img id="img img--delete-icon" src="images/delete.svg" alt="delete icon">
      </article>
      <article class="article article--idea-content">
        <input type="text" value="asdfa">
        <textarea class="textarea textarea--edit">sdf</textarea>
      </article>
      <article class="article article--idea-footer">
        <img src="images/upvote.svg" alt="upvote icon">
        <p>Quality: Swill</p>
        <img src="images/downvote.svg" alt="downvote icon">
      </article>
    </section>`); 
}

function displayModal(event) {
	if (event.target.classList.contains('h3--idea-header' || 'p--idea-body')) {
		modal.style.display = 'block';
		editCard(event);
	}
}

function hideModal(event) {
	if (event.target.id === 'edit-box' || event.key === 'Enter') {
		console.log('click');
		modal.style.display = 'none';
		console.log('click2')
		//will need to call a function that 1) replaces this card without changing time stamp? 2)pushes back into array/localStorage
  }
}

function toggleStar(event) {
  var card = event.target.parentNode.parentNode;
  var ideaIndex = locateIdea(card);
  ideaIndex.updateStar();
  ideas = ideaIndex.saveToStorage(ideas);
  if(ideaIndex.star === true){
    event.target.src = 'images/star-active.svg';
  } else {
    event.target.src = 'images/star.svg';
  }
}

function changeQuality(event) {
  var card = event.target.parentNode.parentNode;
  var ideaIndex = locateIdea(card);
  ideas = ideaIndex.updateQuality(event.target.dataset.direction, qualities.length - 1, ideas); 
  changeQualityText(event, ideaIndex); 
}

function changeQualityText(event, ideaIndex) {
  console.log(event)
  event.target.parentNode.children[1].innerText = `Quality: ${qualities[ideaIndex.quality]}`;
}

function locateIdea(card) {
  var index = ideas.findIndex(function(element) {
    return element.id == card.dataset.id
  }); 
  return ideas[index];
}

function checkFields(fields) {
  for (i = 0; i < fields.length; i++) {
    if (fields[i].value === '') {
      return false;
    }
  }
  return true;
}

function enableButton(button) {
  button.disabled = false;
}

function disableButton(button) {
  button.disabled = true;
}

function clearFields(fields) {
  fields.forEach(function(element) {
    element.value = "";
  });
}