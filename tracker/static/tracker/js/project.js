$(document).ready(function () {
    var _today = new Date();
    var lastDate = new Date(_today.getFullYear(), _today.getMonth() + 1, 0);
    $("#id_key").attr('oninput', "let p=this.selectionStart;this.value=this.value.toUpperCase();this.setSelectionRange(p, p);")
    var site_slug = (window.location.pathname).split("/")[2]
    var url_end = (window.location.pathname).split("/").at(-2)
    // /////////////  EventListeners  //////////////
    //.sidebar .nav .nav-item .nav-link
    if (!($("#sidebar").attr('style')).includes("fff")) {
        $(".sidebar .nav .nav-item .nav-link").css({
            'color': '#fff !important'
        })
        $(".navbar-nav .nav-link.count-indicator").css({
            'color': '#3c3636e0'
        })
    }
    $('#vert-tabs-right-tabContent input[type="radio"]').on('click', function () {
        console.log("the check project type has been changed");
        editRadionBtn();
    });

    document.querySelector("#createProject .modal-content .modal-body").addEventListener("click", (e) => {
        var $el = e.target
        var currentIcon = document.getElementById("current-project-icon")
        if ($el.classList.contains("icon-choice")) {
            var iconObj = { element: $el, currentIcon: currentIcon }
            updateIcon(iconObj)
        } else if ($el.classList.contains("color-choice")) {
            var iconObj = { element: $el, currentIcon: currentIcon }
            updateColorIcon(iconObj);
        } else if ($el.getAttribute("name") == "new-project") {
            createProjectFunc(e);
        } else if ($el.classList.contains("change-icon-btn")) {
            $("#submit-id-new-project").attr("disabled", "true");
            $(".icon-container-parent").show();

        } else if ($el.parentElement.classList.contains("close-icon-selection")) {
            $(".icon-container-parent").hide();
            $("#submit-id-new-project").prop("disabled", false); // this will remove the disabled attribute
        }
    });
    $(".select-this-theme").on("click", (e) => {
        e.preventDefault();
        $(".select-this-theme").attr("disabled", true)
        $(".select-this-theme").text("Updating....")
        var key = $("#vert-tabs-right-tabContent #createProjectForm input[name='key']").val();
        var url = `/trackers/${site_slug}/projects/edit/${key}/`
        var _form = document.querySelector("#vert-tabs-right-tabContent #createProjectForm")
        var form_data = new FormData(_form)
        fetch(url, { method: 'POST', body: form_data })
            .then(response => response.json())
            .then(data => {
                console.log("this is the data", data)
                if (!data.response && data.not_valid) {
                    $("#vert-tabs-right-tabContent #createProjectForm").replaceWith(data.formErrors)
                } else {
                    console.log(data.name)
                    currVal = data.value
                    setTimeout(() => {
                        // CLOSE THE THEME CONTAINER
                        $(".close-change-theme-btn").click();
                        // ALERT THE USER ABOUT THE THEME CHANGE
                        alertUser("project", "has been updated successfully!", "Theme of")
                        setTimeout(() => {
                            $(".select-this-theme").text("Select this Theme")
                            $('.select-this-theme').prop("disabled", false);
                        }, 500)
                    }, 1000);
                    /// change the url when the key ofthe prject is changed
                }

            })

    });
    $("#add_mil").on("click", e => {
        $(".add_mil_section").fadeIn();
        $(e.target).attr("disabled", true)
    })
    $("#edit_mil").on("click", e => {
        $(".edit_mil_section").fadeIn();
        $(e.target).attr("disabled", true)
    })
    var closeMilestone = (e) => {

        $(e.target).parent().parent().fadeOut();
        $("#add_mil").prop("disabled", false)
        $("#edit_mil").prop("disabled", false)
    };
    function createNewMilestone(e) {
        e.preventDefault()
        _form = document.querySelector("#milestoneForm")
        form_data = new FormData(_form);
        var project_key = (window.location.pathname).split("/").at(-3)
        url = `/trackers/${project_key}/create-milestone/`
        fetch(url, { method: "POST", body: form_data })
            .then(response => response.json())
            .then(data => {
                if (data.valid) {
                    if ($("#vert-tabs-right-milestone .empty").length) {
                        $("#vert-tabs-right-milestone .empty").parent().html("");
                    }
                    $(".milestones_body").prepend(data.template);

                    $("#vert-tabs-right-milestone #milestoneForm")[0].reset();
                    $(".mil_close_icon").click();
                    alertUser("Milestone", "created with sucess", "New")
                } else {
                    $("#vert-tabs-right-tabContent #milestoneForm").replaceWith(data.formErrors)
                    $('#milestoneForm #id_end_date').datepicker();
                    $('#milestoneForm #id_start_date').datepicker();
                }
            })
            .catch(error => {
                console.log(error)
                alert("Something went wrong please try again later", error)
            })
    }
    function getEditMilestoneForm(e) {

        $(".edit_mil_section").html(
            `
            <div class="text-center">
                <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
            `
        )
        $("#edit_mil").click();
        var mil_id = $(e.target).parent().attr("data-mil-id-ed");
        var url_mil = `/trackers/edit-milestone/${mil_id}/`
        fetch(url_mil)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    $("#vert-tabs-right-milestone .edit_mil_section").html(data.template)
                    $('#milestoneForm #id_end_date').datepicker({});
                    $('#milestoneForm #id_start_date').datepicker({});
                }
            })
            .catch(error => {
                console.log(error)
                alert("Something when wrong PLease try later!")
            })
    }
    function editMilestone(e) {
        e.preventDefault();
        $(e.target).attr("disabled", true)
        var mil_id = $(".mil_close_icon").attr("data-close-mil")
        var url_mil = `/trackers/edit-milestone/${mil_id}/`
        _form = document.querySelector(".edit_mil_section #milestoneForm")
        form_data = new FormData(_form)
        fetch(url_mil, { method: 'POST', body: form_data, })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    var tr = $(`tr[data-reg="${mil_id}"`)
                    alertUser('Milestone', "has been edited successfully", "Project")
                    $(".mil_close_icon .mdi-close-box").click();
                    tr.html(data.template)
                    $(tr).css({ 'background': '#fff8a226' })
                    $(e.target).prop('disabled', false)
                    setTimeout(() => {
                        $(tr).css({ 'background': 'transparent' });

                    }, 2000)
                } else {
                    $("#vert-tabs-right-tabContent #milestoneForm").replaceWith(data.formErrors)
                }
            })
    }
    function deleteMilestone(e) {

        var mil_id = $(e.target).parent().attr('data-mil-id-de')
        console.log(mil_id)
        $("#del_milestone").attr('data-mil-id-de', mil_id)
    }
    $("#vert-tabs-right-milestone").on("click", (e) => {
        if ($(e.target).attr("id") === "submit-id-save") return createNewMilestone(e);
        if (e.target.classList.contains("mdi-pencil")) return getEditMilestoneForm(e);
        if (e.target.classList.contains("mdi-trash-can")) return deleteMilestone(e);
        if (e.target.classList.contains("mdi-close-box")) return closeMilestone(e);
        if ($(e.target).attr("id") === "submit-id-edit") return editMilestone(e);

    })
    $('#milestoneForm #id_end_date').datepicker({});
    $('#milestoneForm #id_start_date').datepicker({});
    $(".close-icon-selection").on("click", (e) => {
        var key = $("#vert-tabs-right-tabContent #createProjectForm input[name='key']").val();
        var url = `/trackers/${site_slug}/projects/edit/${key}/`
        var _form = document.querySelector("#vert-tabs-right-tabContent #createProjectForm")
        var form_data = new FormData(_form)
        fetch(url, { method: 'POST', body: form_data })
            .then(response => response.json())
            .then(data => {
                if (!data.response && data.not_valid) {
                    $("#vert-tabs-right-tabContent #createProjectForm").replaceWith(data.formErrors)
                } else {
                    console.log(data.name)
                    currVal = data.value
                    setTimeout(() => {

                        // ALERT THE USER ABOUT THE THEME CHANGE
                        alertUser("project", "has been updated successfully!", "The icon of the")
                    }, 1000);

                }

            })
    })

    $("#vert-tabs-right-tabContent input[type='text']").each((index, element) => {
        if (($(element).attr('name') === 'key') | ($(element).attr('name') === 'name')) {
            showInputEditIcon(element);
        }
        $(element).attr("autocomplete", "off");
        $("#vert-tabs-right-tabContent #createProjectForm #id_key").attr('oninput', "let p=this.selectionStart;this.value=this.value.toUpperCase();this.setSelectionRange(p, p);")
    });

    // /////////////// functions  /////////////////

    function createProjectFunc(e) {
        e.preventDefault();
        var _form = document.getElementById("createProjectForm")
        console.log(_form)
        var url = `/trackers/${site_slug}/create_project/`
        data = new FormData(_form)
        console.log("this isthe data from the form", data)
        fetch(url, {
            method: 'POST',
            body: data,
        })
            .then(response => response.json())
            .then(data => {
                if (!data.result) {
                    $(_form).replaceWith(data.formErrors)
                    $("#id_key").attr('oninput', "let p=this.selectionStart;this.value=this.value.toUpperCase();this.setSelectionRange(p, p);")
                    $("#createProjectForm input[type='text']").each( //putting back the autocomplete since this is replace(dynamically created)
                        function () {
                            $(this).attr("autocomplete", "off");
                        }
                    );

                } else {
                    var project_key = data.key.toUpperCase();
                    $("#createProject").modal("hide"); // hiding the modal
                    setTimeout(() => {
                        _form[0].reset();
                        alertUser(project_key, "has been created successufully", "project")
                    }, 1000)
                    InsertNewProject(data);

                }
            })
            .catch(error => {
                console.error('Error:', error);
            })
    };

    function InsertNewProject(data) {
        if (url_end !== 'dashboard') return;
        var newProjectTemplate = `
            <div class="project-instance d-flex align-items-center p-2 position-relative">
                <div class="project-icon mr-3" style="background: ${data.project_color}"><i class="mdi ${data.project_icon} mdi-24px"></i></div>
                <div class="project-details">
                    <p class="project-name">${data.name}</p>
                    <div>
                        <div class="hidden-actions">
                            <div class="align-items-center d-flex mt-1 project-actions">                
                                <a href="#" class="event-title">Add ticket</a>
                                <a href="#" class="event-title">See Tickets</a>
                                <a href="#" class="event-title">Board</a>
                                <a href="#" class="event-title settings" style="border-right: none;"><i class="mdi mdi-settings"></i></a>
                            </div>
                        </div>
                        <div class="project-instance-key">
                            <span> ${data.key}</span>
                        </div>
                    </div>
                </div>
                <div class="item-thumbnail ml-auto">
                        <img src="/static/projectManagement/images/faces/face3.jpg" alt="image" class="profile-pic">
                </div>
                <a href="{% url 'project_details' site_slug=site_slug project_key=project.project_key %}" class="stretched-link"></a>
            </div>
        `
        if ($('.dashboard-projects-container .empty-projects')[0]) { // checking if the class exist and remove the content before inserting new projects
            $(".dashboard-projects-container").html("")
        }
        $('.dashboard-projects-container').prepend(newProjectTemplate)
    }

    function updateIcon(iconObj) {
        // element, currentIcon, dashboardIcon, previewIcon
        var newClass = iconObj.element.classList[2]
        var oldClass = iconObj.currentIcon.firstElementChild.classList[2]
        $(iconObj.currentIcon).children(":first-child").removeClass(oldClass).addClass(newClass);

        // checking if we are in the edit project page
        if ("dashboardIcon" in iconObj) {
            $("#vert-tabs-right-tabContent #id_project_icon").attr("value", newClass)
            console.log($(iconObj.dashboardIcon).children(":first-child"))
            $(iconObj.dashboardIcon).children(":first-child").removeClass(oldClass).addClass(newClass);
            $(iconObj.previewIcon).children(":first-child").removeClass(oldClass).addClass(newClass);
            var oldActiveProjectClass = document.querySelector("#activeProjectLi i").classList[2]
            $("#activeProjectLi i").removeClass(oldActiveProjectClass).addClass(newClass);

        } else {
            $("#vert-tabs-right-tabContent #id_project_icon").attr("value", newClass) // for the hidden innput in the form
        }

    };

    function updateColorIcon(iconObj) {
        var allIcons = document.getElementsByClassName("icon-choice")
        var newColor = iconObj.element.getAttribute("style").slice(-8, -1);
        iconObj.currentIcon.setAttribute("style", `color: ${newColor}`);
        for (let i = 0; i < allIcons.length; i++) {
            const element = allIcons[i];
            element.parentElement.setAttribute("style", `color: ${newColor}`);

        }
        if ("dashboardIcon" in iconObj) {
            iconObj.previewIcon.attr("style", `color: ${newColor}`);
            iconObj.dashboardIcon.attr("style", `color: ${newColor}`);

        } else {
            projectColorInput.setAttribute("value", `${newColor}`) // for the hidden input 
            var projectColorInput = document.getElementById("id_project_color")
        }
    }
    function changeProjectTheme(color, element) {
        var asidenav = document.getElementById("sidebar")
        if ($(element).parent().find(".mdi-check").length === 1) {
            $(element).parent().find(".mdi-check").parent().html("");
        }
        var hover_open = $(".sidebar-icon-only .sidebar .nav .nav-item.hover-open .nav-link .menu-title")
        var sidebarLi = $("#sidebar ul li")
        var alphaColor = shade(color, 0.531)
        var sidebarAnchor = $("#sidebar ul li a")
        // var key = document.querySelector("#vert-tabs-right-tabContent .project-key.badge").textContent;
        asidenav.setAttribute("style", `background:${color};`)
        hover_open.attr("style", `background:${color};`)
        sidebarLi.attr("style", "border-bottom: none;")
        $("#sidebar ul li.borderBottom").attr("style", `border-bottom: 1px solid #f3f3f373;`)
        $(".navbar-brand-wrapper").attr("style", `background:${alphaColor};`)
        $(".navbar-menu-wrapper").attr("style", `background:${alphaColor};`)
        $("#id_project_theme").val(`${color} ${alphaColor}`)
        if (color === "#ffffff") {
            $("<i class='mdi mdi-24px mdi-check' style='color: #000'></i>").appendTo($(element))
            $(element).attr("color", "#000")
            sidebarAnchor.attr("style", "color: #000;");
            $(".menu-arrow").attr("style", "color: #000;");
            $(".theme-choice.selected").attr("style", `background:${color}; `).addClass("border");
        } else {
            $("<i class='mdi mdi-24px mdi-check' style='color: #fff'></i>").appendTo($(element))
            $(".theme-choice.selected").attr("style", `background:${color};`)
            sidebarAnchor.attr("style", "color: #fff;");
            $(".menu-arrow").attr("style", "color: #fff;")
            $(element).attr("color", "#fff")
            //projectThemeSelection();
        }

    }

    function alertUser(key, message, type) {
        alertify.set('notifier', 'position', 'top-right');
        alertify.set('notifier', 'delay', 10);
        alertify.success(`${type} <span class="alert-key">${key} </span>${message}`);
    };
    function showInputEditIcon(el) {

        var _icon = el.closest(".align-items-center").lastElementChild.firstElementChild
        var name = $("#vert-tabs-right-tabContent #createProjectForm input[name='name']").val();
        var key = $("#vert-tabs-right-tabContent #createProjectForm input[name='key']").val();
        var currVal = el.getAttribute("id") === "id_key" ? key : name

        el.addEventListener("keyup", (e) => {
            el.classList.contains("is-invalid") ? el.classList.remove("is-invalid") : "";

            if (currVal !== el.value.trim()) {
                $(".input-edit-icon").each((a, b) => {
                    if ($(b).is(":visible")) {
                        if (b !== _icon) {
                            $(b).fadeOut();
                            $(_icon).fadeIn();
                        }
                    } else if (!$(".input-edit-icon").is(":visible").length) {
                        $(_icon).fadeIn();
                    }
                });
            } else {
                $(_icon).fadeOut();
            }
        });
        el.onfocusout = () => {
            setTimeout(() => {
                if (!document.activeElement.classList.contains("input-edit-icon")) {
                    $(_icon).fadeOut();
                    el.value = currVal;
                }
            }, 400)
        }
        _icon.addEventListener("click", (e) => {
            e.preventDefault();
            $(_icon).fadeOut();
            $(_icon).next().fadeIn();
            var url = `/trackers/${site_slug}/projects/edit/${key}/`
            var _form = document.querySelector("#vert-tabs-right-tabContent #createProjectForm")
            var form_data = new FormData(_form)
            fetch(url, { method: 'POST', body: form_data })
                .then(response => response.json())
                .then(data => {
                    if (!data.response && data.not_valid) {
                        $("#vert-tabs-right-tabContent #createProjectForm").replaceWith(data.formErrors)
                        $(_icon).next().fadeOut()
                    } else {
                        console.log(data.name)
                        currVal = data.value
                        setTimeout(() => {
                            $(_icon).next().fadeOut();
                            if (!data.not_valid) {
                                alertUser(`${data.name}`, 'has been updated successfully!', `Project`)
                            }
                        });
                        /// change the url when the key ofthe prject is changed
                        const domain = location.protocol + '//' + location.host;
                        history.pushState(null, 'project detail key', `${domain}/trackers/${site_slug}/projects/${data.value}/`);
                        (data.name == "key") ? $('.active_project_key').text(`${data.value}`) : $('.active_project').text(data.value);
                    }

                })
                .catch(error => {
                    console.log("there was an error", error);
                })
        });
    }
    document.querySelector("#vert-tabs-right-tabContent").addEventListener("click", (e) => {
        e.stopImmediatePropagation();
        var $el = e.target
        if ($el.classList.contains("change-theme-btn")) {
            $(".theme-container-parent").show();
            $(".close-change-theme-btn").on("click", () => { $(".theme-container-parent").hide(); })


        } else if ($el.classList.contains("change-icon-btn")) {
            $(".edit-project-icon-container-parent").fadeIn();
        } else if ($el.classList.contains("icon-choice")) {
            var currentIcon = document.getElementById("project-edit-current-icon");
            var projectKey = $("#vert-tabs-right-tabContent #id_key").val()
            var dashboardIcon = $(`.active_project_icon`);
            var previewIcon = $(".project-icon.preview-icon");

            // take care of the do not repeat yourself  after

            iconObj = { element: $el, currentIcon: currentIcon, dashboardIcon: dashboardIcon, previewIcon: previewIcon }
            updateIcon(iconObj)
        } else if ($el.classList.contains("color-choice")) {
            var currentIcon = document.getElementById("project-edit-current-icon");
            var projectKey = $("#vert-tabs-right-tabContent #id_key").val()
            var dashboardIcon = $(`.active_project_icon`);
            var previewIcon = $(".project-icon.preview-icon");
            iconObj = { element: $el, currentIcon: currentIcon, dashboardIcon: dashboardIcon, previewIcon: previewIcon }

            updateColorIcon(iconObj);
        } else if ($el.classList.contains("mdi-close-box")) {
            $(".edit-project-icon-container-parent").fadeOut();
        } else if ($el.classList.contains("theme-choice")) {
            _color = $el.getAttribute("style").slice(-8, -1);
            changeProjectTheme(_color, $el);
        }
        return false;
    });
    function hex2(c) {
        c = Math.round(c);
        if (c < 0) c = 0;
        if (c > 255) c = 255;

        var s = c.toString(16);
        if (s.length < 2) s = "0" + s;

        return s;
    }

    function color(r, g, b) {
        return "#" + hex2(r) + hex2(g) + hex2(b);
    }
    function shade(col, light) {

        // TODO: Assert that col is good and that -1 < light < 1

        var r = parseInt(col.substr(1, 2), 16);
        var g = parseInt(col.substr(3, 2), 16);
        var b = parseInt(col.substr(5, 2), 16);

        if (light < 0) {
            r = (1 + light) * r;
            g = (1 + light) * g;
            b = (1 + light) * b;
        } else {
            r = (1 - light) * r + light * 255;
            g = (1 - light) * g + light * 255;
            b = (1 - light) * b + light * 255;
        }

        return color(r, g, b);
    }
    var editRadionBtn = () => {
        var key = $("#vert-tabs-right-tabContent #createProjectForm input[name='key']").val();
        var url = `/trackers/${site_slug}/projects/edit/${key}/`
        var _form = document.querySelector("#vert-tabs-right-tabContent #createProjectForm")
        var form_data = new FormData(_form)
        fetch(url, { method: 'POST', body: form_data })
            .then(response => response.json())
            .then(data => {
                console.log("this is the data", data)
                if (!data.response && data.not_valid) {
                    data.formErrors ? $("#nav-general #createProjectForm").replaceWith(data.formErrors) : ""

                } else {
                    var editPlace = $(".over_header .proj_type")
                    editPlace.text(data.value)
                    alertUser(`Type`, 'has been updated successfully!', `Project`)

                }
            })
            .catch(error => {
                alert('something went wrong please try again!')
            })

    }

})
