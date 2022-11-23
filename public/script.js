const closeButton = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')
closeButton.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal')
        console.log("clse")
        closeModal(modal)
    })
})

const closeModal = (modal) => {
    if (modal == null) return
    modal.classList.remove('active')
    overlay.classList.remove('active')
}