from django.db import models
from django.conf import settings
User = settings.AUTH_USER_MODEL


class Site(models.Model):
    site_name = models.CharField(
        max_length=100,
    )
    admin = models.ForeignKey(
        User, related_name="site", on_delete=models.SET_NULL, blank=True, null=True
    )
    slug = models.SlugField(max_length=20, blank=True, null=True)
    people = models.ManyToManyField(
        User, related_name="participants", blank=True)

    def __str__(self):
        return self.site_name
