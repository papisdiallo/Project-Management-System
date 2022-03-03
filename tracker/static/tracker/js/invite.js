$(document).ready(function () {
    var inviteBtn = document.querySelector("#invite_new_members")
    console.log("this isthe invite btn ", inviteBtn)
    if (inviteBtn !== null) {
        inviteBtn.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("the btn has been clicked for sure");
        })
    }
})