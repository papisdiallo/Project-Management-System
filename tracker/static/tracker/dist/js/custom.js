// imports from custom issues
import { addIssueToUI } from './customIssues.js'
import { CreateIssueAjax } from './customIssues.js'

// elements and queryselectors
const projectNameInput = document.getElementById('id_project_name');
const saveProjectBtn = document.getElementById('createProject');
const editProjectBtn = document.querySelector('#submit-id-editproject');
const anotherProjectBtn = document.getElementById('anotherProject');
const projectKeyInput = document.getElementById('id_key');
const projectTypeInput = document.getElementById('id_project_type');
const csrf = document.getElementsByName('csrfmiddlewaretoken')
const allSelect = document.querySelectorAll("select")
const navProjects = document.querySelector("#navProjects")
const beforeCreateBtn = document.querySelector("#addProjectNav");
const createSagaBtn = document.querySelector("#addSaga");
const epic_keys = document.querySelectorAll(".saga-details")
const addIssueToEpic = document.querySelector("#addIssueToEpic")



let updateMessage = "has been updated successfully!"
export function resizingSelectField(select_id) {
    $("#" + `${select_id}`).change(function () {
        var text = $(this).find('option:selected').text()
        var $aux = $('<select/>').append($('<option/>').text(text))
        $(this).after($aux)
        $(this).width($aux.width())
        $aux.remove()
    }).change();
}
// this function will change the formation of the javascript object to a more human readable date
function dateFormating(dateObj, hours = false) {
    var options1 = { "month": 'short', "day": 'numeric', "year": 'numeric', }
    var options2 = { "month": 'short', "day": 'numeric', "year": 'numeric', "hour": 'numeric', "minute": 'numeric', }
    var dateTimeFormat = Intl.DateTimeFormat('default',);

    if (dateObj === null) {
        return "None";
    } else {
        var myDate = new Date(dateObj.toString());
        if (hours) {
            var dateTimeFormat = Intl.DateTimeFormat('default', options2);
            return dateTimeFormat.format(myDate);
        } else {
            var dateTimeFormat = Intl.DateTimeFormat('default', options1);
            return dateTimeFormat.format(myDate)
        }
    }
}
var selectShowIconFunc = select_id => {
    var select = document.getElementById(`${select_id}`)
    let currentValue = select.selectedIndex // getting the current value of the select
    var icon = $("#" + `${select_id}` + "_icon"); // getting the field icon
    $("#" + `${select_id}`).change(function () {
        var new_value = select.selectedIndex
        if (new_value === currentValue) { // hide the submit icon
            $("#" + `${select_id}` + "_icon").fadeOut();
        } else { // show the submit icon           
            $("#" + `${select_id}` + "_icon").fadeIn();
        }
    });

    // handling the focus out when the user leave the input without save...
    select.onfocusout = function () {
        setTimeout(() => {
            if (document.activeElement.getAttribute("id") != icon.attr("id")) {
                select.value = currentValue // reset the select to the initial value
                icon.fadeOut();
            }
        }, 500)
    }
};


var inputShowIconFunc = input_id => {
    var input = document.getElementById(`${input_id}`)
    var icon = $("#" + `${input_id}` + "_icon"); // getting the field icon
    if (!input) { return; }
    var currentValue = input.value
    $("#" + `${input_id}`).on("keyup", function () {
        if (currentValue === input.value) { // hide the submit icon           
            icon.fadeOut();
        } else { // show the submit icon            
            icon.fadeIn();
        }
    });

    // handling the focus out without any save
    input.onfocusout = function () {
        setTimeout(() => {
            if (document.activeElement.getAttribute("id") != icon.attr("id")) {
                input.value = currentValue // reset the input to the initial value
                icon.fadeOut();
            }
        }, 500)
    }
}
let observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
            resizingSelectField("id_epic_status");
            document.getElementById("id_epic_status").onchange = changeStatusBack;
            $('#id_end_date').datepicker();
            // Checking if any select has been updated and show the submit icon
            $("#custom-tabs-four-tabContent select").each(function (a, b) {
                var select_id = b.getAttribute("id");
                selectShowIconFunc(select_id);
            });
            // Checking if any input has changed value and display the submit icon
            $("#custom-tabs-four-tabContent input").each(function (a, b) {
                var input_id = b.getAttribute("id");
                inputShowIconFunc(input_id);
            });
            // 
            selectShowIconFunc("id_end_date");
            // listening to any submit event from the user
            $(".icons").each(function (a, b) {
                b.addEventListener("click", editSagaFunc)
            });
            var epic_key = $(".epic_key.bold").innerText

            // add the eventlistener for the add new ticket to epic
            document.getElementById("openAddIssue").addEventListener("click", openAddIssueToEpic)
            document.querySelector(".openAddIssueToEpic").addEventListener("click", openAddIssueToEpic)
            document.querySelector(".add-desc").addEventListener("click", () => {
                $(".add-description").slideToggle(300, () => { });
            });
            document.querySelector(".add-description-btn").addEventListener("click", (e) => {
                e.preventDefault();
                $(".add-description .icon-desc").fadeIn();
                setTimeout(() => {
                    $(".add-description .icon-desc i").removeClass("fa-spinner fa-spin").addClass("fa-check-circle");
                    setTimeout(() => {
                        $(".add-description .icon-desc").fadeOut();
                        setTimeout(() => {
                            $(".add-description .icon-desc i").removeClass("fa-check-circle").addClass("fa-spinner fa-spin");
                        }, 1000)
                    }, 1500)
                }, 1000)
            });
            document.querySelector(".close-desc").addEventListener("click", (e) => {
                e.preventDefault();
                $(".add-description").slideUp(300, () => { });
            })
        }
    })
});
const sagaFormLocated = document.querySelector(".sagaFormLocal")
observer.observe(sagaFormLocated, { "childList": true })

// function that helps to get  the offset height
function offsetHeight(class_or_id) {
    return document.querySelector(class_or_id).offsetHeight
}
document.querySelector(".cardEpicBody").addEventListener('click', (e) => {
    if (e.target.tagName === "A") {
        var epicKey = e.target.textContent
        var url = `/api-sagaForm/${epicKey}/`
        var formLocal = document.querySelector(".sagaFormLocal");

        $.ajax({
            url: url,
            data: { "epicKey": epicKey },
            success: function (data) {
                formLocal.innerHTML = data.epicForm
                var tinyMceHeight = offsetHeight("#editSaga .col-5") - offsetHeight("#CreateSagaForm .flex-column") - offsetHeight("#CreateSagaForm .card-header") - offsetHeight("#CreateSagaForm .card-body .justify-content-around") - 50
                // calculatee the height that tinymce should take

                tinymce.remove();
                tinymce.init({ mode: "textareas", width: "100%", height: tinyMceHeight, resize: false, toolbar_mode: 'floating' });
                var background = data.background
                var epicTickets = data.epicTickets
                document.querySelector(".badge-light.tickets-count").textContent = data.ticketsCount
                var data = JSON.parse(data.instance)
                var epicPreviewLocal = document.querySelector(".epicPreview");
                var nameEpicPreviewLocal = document.querySelector(".nameEpicPreview");

                // Populate the epic preview local
                PopulateEpicPreview(nameEpicPreviewLocal, epicPreviewLocal, epicKey, data, background)
                PopulateEpicTicketsLocal(epicTickets);

                // setting the height of the epicTickets 
                var modalContentHeight = document.querySelector("#editSaga .modal-content").offsetHeight
                var epicPreviewHeight = document.querySelector('.epicPreview').offsetHeight
                var epicUrlHeight = document.querySelector(".epicUrl").offsetHeight
                var epicHeaderHeight = document.querySelector(".epicTicketsHeader").offsetHeight
                document.querySelector("#epicTickets").style.maxHeight = modalContentHeight - epicHeaderHeight - epicPreviewHeight - epicUrlHeight - 25 + 'px';



            },
            error: function (error) {
                console.log("Here is what went wrong", error)
            }
        });
    } else { return; }
});

// adding mutation for the setting the height


function checkIfNull(value) {
    return value ? value : "-"
}
function PopulateEpicPreview(header, body, epickey, data, background) {
    var hours = true;
    var end_date = dateFormating(data[0]["fields"]["end_date"])
    var start_date = dateFormating(data[0]["fields"]["start_date"])
    var date_created = dateFormating((data[0]['fields']['date_created']), hours)
    var estimated = checkIfNull(data[0]["fields"]["epic_estimated_hours"])
    var summary = checkIfNull(data[0]["fields"]["epic_summary"])
    var reporter = checkIfNull(data[0]["fields"]["epic_reporter"])
    var assignee = checkIfNull(data[0]["fields"]["epic_assignee"])
    // Populating the header of the epic preview
    header.innerHTML = `
    <div class="d-flex align-items-center justify-content-between px-3 py-2">
        <div class="d-flex align-items-center text-muted">
           <span class="mr-1"> new-software / </span>
           <span>${epickey}/ </span>
        </div>
        <div class="icons">
            <i class="fas fa-file-csv  "></i>
            <i class="fas fa-file-export    "></i>
            <span class="badge badge-lighter"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></span>
        </div>
    </div>
    `
    //Populating the local body of the epic Preview 
    body.innerHTML = `
        <div class="d-flex px-3 mb-2 justify-content-between">
            <span class="name"><h5>${data[0]["fields"]["name"]}</h5></span>
            <div class="">
                <span class="badge badge-danger">Due date</span>
                <span name="end_date">${end_date}</span>
            </div>
        </div>
        <div class="d-flex border-top py-1 px-3">
            <div class="d-flex align-items-center">
                    <div class="default-profile-picture2">DS</div>
                    <div class="d-flex ml-1 mt-1 flex-column">
                    <p class="lead2 m-0">Username</p>
                    <span class="m-0 text-muted">Created: ${date_created} </span>
                    </div> 
            </div>
            <div class="ml-auto d-flex align-items-center">
                <span class="badge ml-3" name="epic_status" style="background: ${background} ;">
                    ${data[0]["fields"]["epic_status"]}
                </span>
            </div>
        </div>
        <div class="d-flex align-items-center border-top py-2">
            <div class="col-sm-8 border-right d-flex">
                <span class="mr-1 label">Name: </span>
                <span name="name" class="flex-grow-1 text-center">
                    ${data[0]["fields"]["name"]}
                </span>
            </div>
            <div class="col-sm-4 d-flex align-items-center">
                <span class="mr-1 label">Estimated: </span>
                <span name="epic_estimated_hours" class="badge badge-light m-auto">
                   ${estimated}
                </span>
            </div>
        </div>
        <div class="d-flex align-items-center border-top py-1">
            <div class="col-sm-6 d-flex align-items-center border-right">
                <span class="mr-1 label">Assignee: </span>
                <div class="d-flex align-items-center justify-content-center flex-grow-1">
                    <span id="subm_pp mb-0" class="default-profile-picture mt-0" >RW</span>
                    <span name="epic_assignee" class="ml-2">${assignee}</span>
                </div>
            </div>
            <div class="col-sm-6 d-flex align-items-center">
                <span class="mr-1 label">Reporter: </span>
                <div class="d-flex align-items-center justify-content-center flex-grow-1">
                    <span id="subm_pp mb-0" class="default-profile-picture mt-0" >RW</span>
                    <span name="epic_reporter" class="ml-2">${reporter}</span>
                </div>
            </div>
        </div>
        <div class="d-flex align-items-center border-top border-bottom py-2">
            <div class="col-sm-12 py-1 d-flex">
                <span class="mr-1 label">Summary: </span>
                <span  name="epic_summary" class="flex-grow-1 text-center">
                    ${summary}
                </span>
            </div>
        </div>
    `
}

function PopulateEpicTicketsLocal(template) {
    var epicTicketsLocal = document.getElementById("epicTickets").querySelector(".ticketsContainer");
    epicTicketsLocal.innerHTML = template;
}
// mutation observer for the saga modal so that we will set 
// the height of the tickets in epic instance
// urls
const site_slug = (window.location.pathname).split("/")[1];
const key_project = (window.location.pathname).split("/")[2];
const createProjectUrl = window.location.hostname + `:8000/${site_slug}/` + "add-new-project/"


// EventListeners
saveProjectBtn.addEventListener('submit', createNewProjectFunc);
//editProjectBtn.addEventListener('click', editProjectFunc);
createSagaBtn.addEventListener('click', createNewSagaFunc);
addIssueToEpic.addEventListener('submit', CreateIssueAjax(true))

// Functions

const sagaUrl = document.getElementById("createSagaForm").getAttribute('data-url');
function hideValidation() {
    $(`#error_1_id_epic_name`).hide();
    document.getElementById("id_Name").style.borderColor = "#ededed"
}

function createNewSagaFunc(e) {
    e.preventDefault();
    if (document.getElementById("id_Name").value.trim() === "") {
        $(`#error_1_id_epic_name`).show();
        document.getElementById("id_Name").style.borderColor = "#dc3545"

    } else {
        $.ajax({
            url: sagaUrl,
            type: "POST",
            data: {
                "name": document.getElementById("id_Name").value,
                "key_project": key_project,
                'csrfmiddlewaretoken': csrf[0].value,
            },
            success: function (data) {
                var name = data.name
                var bg = data.bg
                var _id = data._id
                var epic_key = data.epic_key
                var localToInsert = document.querySelector(`#createSagaForm`)
                localToInsert.insertAdjacentHTML('afterend', `           
                    <div class="epic-instance">
                        <div class="accordion sagaInstance d-flex" id="${_id}">
                            <span class="ml-2" type="button" data-toggle="collapse" data-target="#singleSagaBody${_id}" aria-expanded="true" aria-controls="singleSaga">
                                <i class="fa fa-angle-right epicCollapse" aria-hidden="true"></i>
                            </span>
                            <div class="card mb-1 mx-2">
                                <div class="card-header" style="border-top: 3px solid ${bg}">
                                    <span class="m-0 epicName">${name}</span>
                                    <span id="${epic_key}" class="tooltips float-right" data-toggle="tooltip"  title="Add issue to this epic">
                                        <i  class="fa fa-plus edSaga" aria-hidden="true" data-toggle="modal" data-target="#createSaga"></i>
                                    </span>
                                </div>
                                <div class="collapse Saga" data-parent="#${_id}"  id="singleSagaBody${_id}">
                                    <div class="card-body">
                                        <span class="saga-details" data-toggle="modal" data-target="#editSaga">${epic_key}</span>
                                        <span class="d-block">Issues <span class="badge badge-light float-right ">0</span></span>
                                        <span class="d-block">Completed <span class="badge badge-light float-right ">0</span></span>
                                        <span class="d-block">Uncompleted <span class="badge badge-light float-right ">0</span></span>
                                        <span class="d-block">Estimated <span class="badge badge-light float-right ">0</span></span>
                                        <span class="d-block">Unestimated <span class="badge badge-light float-right ">0</span></span>                                    
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>        
                
                `)
                $("#createSagaForm")[0].reset();
                alertify.set('notifier', 'position', 'top-right');
                alertify.set('notifier', 'delay', 7);
                alertify.success(`New Epic ${epic_key} created successfully!`);

            },
            error: function (error) {
                console.log(error)
            }
        });
    }
}
var updateEpicPreview = (myName, local, value) => {
    var mylocal = local.querySelector(`[name=${myName}]`)
    mylocal.textContent = value
}
function openAddIssueToEpic() {
    var addIssueToEpicLocal = document.getElementById("addIssueToEpic")
    let visibleForm = $("#addIssueToEpic").is(":visible");
    let editObserver;

    if ($(".add-description").is(":visible")) {
        $(".add-description").slideUp(100, () => { })
    }
    if (!visibleForm) {
        $("#addIssueToEpic").show('slide', { direction: 'right' }, 300);
    } else { // this will be added when I add the close btn
        $("#addIssueToEpic").hide("slide", { direction: 'right' }, 300);
    }
    editObserver = new MutationObserver(mutations => {
        observerCallBack(mutations)

    });
    editObserver.observe(addIssueToEpicLocal, { childList: true })
    var epic_key = document.querySelector(".epic_key.bold").textContent // getting the key of the current epic
    $.ajax({
        url: "/openAddIssueToEpic/",
        data: { "epic_key": epic_key },
        success: function (data) {
            $("#addIssueToEpic .card-header .bold").html(epic_key)
            $("#addIssueToEpic .form-body").html(data)
            tinymce.remove();
            tinymce.init({ mode: "textareas", width: "100%", height: "350", resize: false, toolbar_mode: 'floating' });
            document.querySelector('#addIssueToEpic button.close').addEventListener("click", () => {
                $("#addIssueToEpic").hide("slide", { direction: 'right' }, 300);
            });
        },
        error: (error) => {
            console.log('Something when wrong', error)
        },
    })
}


function observerCallBack(mutations) {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
            $("#AddIssueToEpic .form-body").css({
                maxHeight: outerHeight($("#addIssueToEpic").height() - $("#addIssueToEpic .card-header").outerHeight() - $("#addIssueToEpic .card-footer").outerHeight())
            });
        }

    });
}
function editSagaFunc(e) {
    e.preventDefault();
    // activate only the first click and ignore the others(will allow to know if the submit btn is active)
    // and reset the value if the not clicked 
    if (!e.detail || e.detail == 1) { // disabling the button to avoid any other click from user
        e.target.parentElement.style.cursor = "not allowed";
        $(e.target).removeClass("fa-check-circle").addClass("fa-spinner fa-spin")
        var _form = $("#CreateSagaForm")
        var parentDiv = e.target.parentElement.previousElementSibling
        var lastChild = parentDiv.lastElementChild
        let myNameAndTag = (parentDiv.children.length === 2) ? [lastChild.getAttribute("name"), lastChild.tagName] : [lastChild.getAttribute("name"), lastChild.tagName]

        var epic_key = document.getElementById("id_epic_key").value;
        $.ajax({
            url: `/edit-saga/${epic_key}/`,
            type: "POST",
            data: _form.serialize(),
            success: function (data) {
                var value = data.field_value // get the field value from the database 
                var epicPreviewLocal = document.querySelector(".epicPreview");
                // var field_name = data.field_name
                // updating the epic Preview local
                setTimeout(() => {
                    $(e.target).removeClass("fa-spinner fa-spin").addClass("fa-check")
                    setTimeout(() => {
                        updateEpicPreview(myNameAndTag[0], epicPreviewLocal, value)
                        $("#id_" + `${myNameAndTag[0]}` + "_icon").fadeOut();
                        if (myNameAndTag[1] === "SELECT") {
                            selectShowIconFunc("id_" + `${myNameAndTag[0]}`)

                        } else {
                            inputShowIconFunc("id_" + `${myNameAndTag[0]}`)
                        }
                        $(e.target).removeClass("fa-spinner fa-check").addClass("fa-check-circle")
                    }, 500)
                }, 1000)

            },
            error: function (error) {
                console.log("error", error)
            }
        });
    }

}
export function alertUser(key, message) {
    alertify.set('notifier', 'position', 'top-right');
    alertify.set('notifier', 'delay', 5);
    alertify.success(`Epic ${key}  ${message}`);

}
export function changeStatusBack() {
    var index = this.selectedIndex;
    var select = this
    $.ajax({
        url: "/change-selectBackground/",
        type: "GET",
        data: { "pk": index },
        success: function (data) {
            var background = data.background;
            var style = select.getAttribute('style')
            select.setAttribute('style',
                `${style} color: #fff;
                 background: ${background} url("data:image/svg+xml,<svg height='10px' width='10px' viewBox='0 0 16 16' fill='%23000000' xmlns='http://www.w3.org/2000/svg'><path d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/></svg>") no-repeat right !important;
                 background-position-x: calc(100% - 10px) !important;
                 background-position-y: 13px !important;
                 border: none;`
            );
            setTimeout(() => {
                select.blur()
            }, 1000)
        },
        error: function (e) {
            console.log(e, "error");
        }

    })
}
function createNewProjectFunc(e) {
    e.preventDefault();
    createProjectBtn.textContent = "Creating..."
    createProjectBtn.classList.remove('btn-primary')
    createProjectBtn.classList.add('btn-info');
    $.ajax({
        url: "/add-new-project/",
        type: "post",
        data: {
            "siteSlug": site_slug,
            "projectName": projectNameInput.value,
            "projectKey": projectKeyInput.value,
            "projectType": projectTypeInput.value,
            'csrfmiddlewaretoken': csrf[0].value,
        },
        success: function (data) {
            var key = data.key
            var project_name = data.name
            var avatarUrl = data.url
            new_sp = document.createElement('span')
            var parent = beforeCreateBtn.parentNode
            new_sp.innerHTML = `<a href="#" class="dropdown-item has-icon">
                                    <img src="${avatarUrl}" height="25px" width="25px" />
                                    ${project_name}
                                </a>`;
            setTimeout(() => {
                parent.insertBefore(new_sp, beforeCreateBtn)
                $("#createProject").modal('hide')
                $('.modal').on('hidden.bs.modal', function () {
                    $(this).find('form')[0].reset();
                });
                createProjectBtn.textContent = "Create"
                createProjectBtn.classList.remove('btn-info');
                createProjectBtn.classList.add('btn-primary')
                alertify.set('notifier', 'position', 'top-right');
                alertify.set('notifier', 'delay', 7);
                alertify.success(`Project ${key} has been created successfully!`);

            }, 3000)
        },
        error: function (error) {
            console.log("There was an error:", error)
        }
    })
}


// function editProjectFunc(e) {
//    editProjectUrl = document.getElementById('editProjectForm').parentElement.getAttribute('data-url')
//     e.preventDefault();
//     editProjectBtn.value = "Updating..."
//     editProjectBtn.classList.remove('btn-primary')
//     editProjectBtn.classList.add('btn-secondary');
//     var _form = $("#editProjectForm")
//     $.ajax({
//         url: editProjectUrl,
//         type: "POST",
//         data: _form.serialize(),
//         success: function (data) {
//             var key = data.key
//             setTimeout(() => {
//                 editProjectBtn.value = "Save changes"
//                 editProjectBtn.classList.remove('btn-secondary');
//                 editProjectBtn.classList.add('btn-primary')
//                 alertify.set('notifier', 'position', 'top-right');
//                 alertify.set('notifier', 'delay', 7);
//                 alertify.success(`Project ${key} has been updated successfully!`);

//             }, 3000)

//         },
//         error: function (error) {
//             console.log("error", error)
//         }
//     })

// };

// Keep that for later (when generating a key for the user)
// deniedKeyValue = ['on', 'an', 'the', 'is', 'in', 'it', 'a', 'of', 'by', 'for', 'The', 'are', 'This', 'this']

// $("#id_project_name").on('keyup', () => {

//     //turning the input value into an array so we can run the filter for denied values on it
//     const projectNameValueArray = projectNameInput.value.split(" ").filter(i => i);;

//     // excluding the words in the array deniedKeyValue and running the match to get the first letter of each word
//     let keyMatches = projectNameValueArray
//         .filter(e => !deniedKeyValue.includes(e))
//         .join(" ")
//         .match(/\b(\w)/g);

//     if (keyMatches != null) {  // Make sure the user enters something first
//         projectKeyInput.value = keyMatches.join("").toUpperCase();
//     }
// });


$('#epicBtn').click(function () {
    $('#hiddenEpics').addClass('d-block').removeClass('hidden');
});

$('#ticketDetails').click(function () {
    $('#productBacklog').toggle("slow");
})
$('button[data-dismiss="modal"]').click(function () {
    $(this).parent().parent().parent().parent().modal('hide');
})

$("#cancel").click(function () {
    $("#createProject").modal('hide')
    $('.modal').on('hidden.bs.modal', function () {
        $(this).find('form')[0].reset();
    });
});


// Handle the sorting and saving the positions section 
const allColumns = document.querySelectorAll(".sagaContainer");
const allSagaInstances = document.querySelectorAll(".sagaInstance");

$(document).ready(function () {
    $(function () {
        $(".row .sagaContainer").sortable({
            connectWith: ".draggableSaga",
            update: function () {
                const sagaOrderColumns = { "Columns": [] };
                allColumns.forEach(container => {
                    const sagaInstanceIds = new Array();
                    container.querySelectorAll(".accordion.sagaInstance").forEach(instance => {
                        sagaInstanceIds.push(Number.parseInt(instance.id));
                    });
                    sagaOrderColumns.Columns.push(
                        { 'columnId': container.id, 'itemsId': sagaInstanceIds }
                    )
                });

                $.ajax({
                    url: "/sort-saga/",
                    type: "post",
                    datatype: "json",
                    data: { "sagaOrderColumns": JSON.stringify(sagaOrderColumns) },
                })
            }
        });
        $(".row .sagaContainer").disableSelection();
    });

    $(function () {
        $(".sprintBody .ticketsContainer").sortable({
            helper: 'clone',
            connectWith: "#ticketsBody .ticketsContainer",
            forcePlaceholderSize: true
        });
        $(".sprint .sprintTicketContainer").disableSelection();
    });

    $(function () {
        $("#ticketsBody .ticketsContainer").sortable({
            //prreventing the associated click event
            helper: 'clone',
            connectWith: ".sprintBody .ticketsContainer",
            forcePlaceholderSize: true
        }
        );
        $("#ticketsBody .ticketsContainer").disableSelection();
    });

});



// End of the sorting and saving positions section

//the validation section 
var fieldValidationFunc = (inputId) => {
    $(`#${inputId}`).on('keyup', function () {
        $.ajax({
            url: "/validate-project-name/",
            data: {
                'inputValue': $(this).val(),
            },
            dataType: 'json',
            success: function (data) {
                if (data.is_taken) {
                    $(`#error_1_${inputId}`).show();
                    document.getElementById(`${inputId}`).style.borderColor = "#dc3545";
                    document.getElementById("createProjectBtn").disabled = true;
                } else {
                    $(`#error_1_${inputId}`).hide();
                    document.getElementById(`${inputId}`).style.borderColor = "#092e29";
                    document.getElementById("createProjectBtn").disabled = false;
                }
            }
        });
    });
    $(`#${inputId}`).focusout(function () {
        document.getElementById(`${inputId}`).style.borderColor = "#ededed";
    })
};
fieldValidationFunc("id_project_name");
fieldValidationFunc("id_key")

function forceKeyPressUppercase(e) {
    var charInput = e.keyCode;
    if ((charInput >= 97) && (charInput <= 122)) { // lowercase
        if (!e.ctrlKey && !e.metaKey && !e.altKey) { // no modifier key
            var newChar = charInput - 32;
            var start = e.target.selectionStart;
            var end = e.target.selectionEnd;
            e.target.value = e.target.value.substring(0, start) + String.fromCharCode(newChar) + e.target.value.substring(end);
            e.target.setSelectionRange(start + 1, start + 1);
            e.preventDefault();
        }
    }
}

projectKeyInput.addEventListener("keypress", forceKeyPressUppercase, false);


if (document.getElementById('error_1_id_project_name')) {
    document.getElementById('div_id_project_name').style.marginBottom = ".25rem";
    document.getElementById('div_id_key').style.marginBottom = ".25rem";
} else if (document.getElementById('error_1_id_key')) {
    document.getElementById('div_id_key').style.marginBottom = ".25rem";
}


// Handling the spinner section


