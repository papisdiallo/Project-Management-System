// importing functions from custom.js
import { resizingSelectField } from './custom.js'
import { changeStatusBack } from './custom.js'
import { alertUser } from './custom.js';

// consts and btns
const IssueForm = document.getElementById("CreateIssueForm");
const editIssueLocal = document.getElementById("div_editIssue");
const createIssueModal = document.querySelector("#createIssue .modal-body")

// addEventlisteners
createIssueModal.addEventListener("submit", CreateIssueAjax(false))
document.getElementById("ticketsBody").addEventListener("click", OpenUpdateIssue)

// UI Functions
$("#id_due_date").datepicker();
// Create a new issue and adding it to the ui
export function CreateIssueAjax(epic = false) {
    return (e) => {
        e.preventDefault();

        $("#addIssueToEpic #id_saga").removeAttr('disabled')

        var _form = epic ? $("#addIssueToEpic #CreateIssueForm") : $("#CreateIssueForm")
        $.ajax({
            url: "/create-issue/",
            type: "post",
            data: _form.serialize(),
            datatype: 'json',
            success: function (data) {
                // calling the add to UI function
                epic ? addIssueToUI(data, _form, epic) : addIssueToUI(data, _form)
                // alert the user(alertify.js)
            },
        });
    }
}
export function OpenUpdateIssue(e) {
    if (e.target.matches("ul")) {
        return;
    } else {
        let issue_key = e.target.tagName !== "LI" ? e.target.closest("li").getAttribute("id") : e.target.getAttribute("id");
        document.querySelector(".spinner-border").style.display = "block"
        editIssueLocal.style.filter = "blur(1px)"
        let editObserver;
        let visibleIssue = $("#div_editIssue").is(":visible");
        if (!visibleIssue) {
            $("#div_editIssue").show('slide', { direction: 'right' }, 300);
            $("#ticketsBacklog").toggleClass("ticketsBacklog showEditIssue")
        }
        editObserver = new MutationObserver(mutations => {
            observerCallBack(mutations);
        });
        editObserver.observe(editIssueLocal, { childList: true });
        $.ajax({
            url: `/api-IssueForm/${issue_key}/`,
            type: "get",
            data: "",
            success: function (data) {
                document.getElementById("div_editIssue").innerHTML = data.template
                tinymce.remove();
                tinymce.init({ mode: "textareas", width: "100%", height: "350", toolbar_mode: 'floating', background: "blue" });

            },
            error: function (error) {
                console.log("error", error)
            }

        });

    }
}

export function regulateDiv() {
    var parentHeight = document.querySelector(".backlogTicketsBody").offsetHeight
    var editIssueHeaderHeight = document.querySelector("#div_editIssue .card-header").offsetHeight
    var ticketBacklogHeaderHeight = document.querySelector("#ticketsBacklog .card-header").offsetHeight
    var editIssueBody = document.querySelector("#div_editIssue .card-body")
    editIssueBody.style.maxHeight = parentHeight + ticketBacklogHeaderHeight - editIssueHeaderHeight + 'px'
    $("#issuePeopleBody #div_id_Assignee").removeClass("form-group").addClass("form-inline")
    $("#issuePeopleBody #div_id_reporter").removeClass("form-group").addClass("form-inline");

    document.querySelector(".spinner-border").style.display = "none";
    editIssueLocal.style.filter = "blur(0)"
    // resize the issue status based on the width
    resizingSelectField("id_issue_status.mb-0")
    // need to add the change of the background status
    document.querySelector(".card-header #id_issue_status").onchange = changeStatusBack;
    document.querySelector("#submit-id-editissue").addEventListener("click", updateIssue)
    const closeEditIssueBtn = document.querySelector(".close.closeEditIssue")
    closeEditIssueBtn.addEventListener("click", closeEditIssue);
}
export function observerCallBack(mutations) {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
            regulateDiv();
        }
    });
};

// add issue to UI function
export function addIssueToUI(data, form, epic = false) {
    var issue_epic = data.issue_epic // check if there is an epic link
    if (issue_epic === "") {
        $("#unLinkedticketsContainer").prepend(data.template)
    } else {
        $(`#${issue_epic}_ticketsContainer`).prepend(data.template)
    }
    if (epic) {
        var ticketsCount = parseInt(document.querySelector(".tickets-count").textContent) + 1
        $("#epicTickets ul.ticketsContainer").prepend(data.template)
        document.querySelectorAll(".tickets-count").forEach(span => {
            span.textContent = ticketsCount
        });
    }
    // update the tickets counts
    var issueCount = parseInt(document.getElementById("ticketsCounts").textContent) + 1
    if (data.issue_epic) {
        $(`#singleSagaBody${data.issue_epic_id} .card-body `).html(data.epic_details)
        $("#addIssueToEpic #id_saga").prop("disabled", true)
    }
    document.getElementById("ticketsCounts").textContent = issueCount;
    form[0].reset();
    // update the issues total in epic backlog
}

// closeEditIssueLocalFunction
export function closeEditIssue() {

    $("#div_editIssue").hide('slide', { direction: 'right' }, 300);
    $("#ticketsBacklog").toggleClass("ticketsBacklog showEditIssue")
}

// update Issue function
export function updateIssue(e) {
    e.preventDefault();
    var issue_key = document.querySelector("#issue_prio .ml-auto > .lead2").textContent
    $.ajax({
        url: `/edit-issue/${issue_key}/`,
        type: "POST",
        data: $("#UpdateIssueForm").serialize(),
        success: function (data) {
            // change the btn innerContext
            document.querySelector("#submit-id-editissue").value = "Updating..."
            document.querySelector("#submit-id-editissue").disabled = true;
            setTimeout(() => {
                // update the Dom
                var li = document.querySelector(`.ticketsContainer #${issue_key}`)
                li.innerHTML = data.template
                document.querySelector("#submit-id-editissue").value = "Update"
                document.querySelector("#submit-id-editissue").disabled = false;
                // alert the user
                alertUser(issue_key, "has been updated successfully!")

            }, 1500);
        },
        error: function (error) {
            console.log(error);
        }
    })
}

// How to update the the space of the body and also the header before even it fires