const closeButton = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')
closeButton.forEach(button => {  // add a click event
    button.addEventListener('click', () => {
        const modal = button.closest('.modal') //find an element above which is a modal
        closeModal(modal)
    })
})

const closeModal = (modal) => { //hide the element 
    if (modal == null) return
    modal.classList.remove('active')
    overlay.classList.remove('active')
}