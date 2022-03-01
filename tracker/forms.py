from django import forms

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