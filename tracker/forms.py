from django import forms
from .models import Site


class CreateSiteForm(forms.ModelForm):
    site_name = forms.CharField(
        max_length=60,
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
                "placeholder": "Your site name",
            }
        ),
        label="Site name",
    )

    class Meta:
        model = Site
        fields = ("site_name",)


class CreateProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super(CreateProjectForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_id = "editProjectForm"
        self.fields["key"].help_text = "A key can not be more than 9 characters"
        self.helper.layout = Layout(
            Row(
                Column(
                    "project_name",
                    placeholder="Enter your project name",
                    css_class="form-group col-md-6 mb-0",
                ),
                Column(
                    "manager",
                    HTML(""" <span class="default-profile-picture" >WW</span>"""),
                    css_class="form-group d-flex align-items-center col-md-3 mb-0",
                ),
                css_class="form-row",
            ),
            Row(
                Column("project_type", css_class="form-group col-md-6 mb-0"),
                Column(
                    "project_lead",
                    HTML(""" <span class="default-profile-picture" >SD</span>"""),
                    css_class="form-group col-md-3 d-flex align-items-center mb-0",
                ),
                css_class="form-row",
            ),
            Row(
                Column(
                    AppendedText(
                        "key", '<i class="fas fa-exclamation-circle"></i>'),
                    css_class="form-group col-md-6 mb-0",
                ),
                Column(
                    AppendedText(
                        "project_site", '<i class="fas fa-exclamation-circle"></i>'
                    ),
                    css_class="form-group col-md-6 mb-0",
                ),
                css_class="form-row",
            ),
            Row(
                Column(
                    HTML(
                        """<img src="{{project.avatar.url}}" class="project-avatar d-inline-block"/>"""
                    ),
                    "avatar",
                    css_class="form-group col-lg-6 mb-0 d-flex align-items-center",
                ),
                Column("project_description", css_class="col-lg-6 mb-0"),
                css_class="form-row",
            ),
            Submit("editProject", "Save Changes"),
        )
