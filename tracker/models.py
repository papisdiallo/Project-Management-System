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


class projectManager(models.Manager):
    def get_by_natural_key(self, project_name):
        return self.get(project_name=project_name)


class Project(models.Model):
    objects = projectManager()
    typeChoices = (
        ("Software Development", "Software Development"),
        ("Task Management", "Task Management"),
        ("Business Management", "Business Management"),
    )

    project_manager = models.ForeignKey(
        User,
        related_name="project_manager",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    project_site = models.ForeignKey(
        Site, related_name="projects", on_delete=models.CASCADE, blank=True, null=True
    )
    members = models.ManyToManyField(User, related_name="projects")
    project_name = models.CharField(max_length=150)
    avatar = models.ImageField(
        upload_to="project_avatar", blank=True, null=True)
    project_type = models.CharField(max_length=25, choices=typeChoices)
    slug = models.SlugField(max_length=30, blank=True)
    key = models.CharField(max_length=9, unique=True)
    project_description = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.project_name

    def natural_key(self):
        return self.project_name

    def get_members(self):
        return self.members.all()

    def add_member(self, member):
        if not member in self.member.all():
            self.members.add(member)
            self.save()  # don't think it is necessary

    def remove_member(self, member):
        if member in self.members.all():
            self.members.remove(member)

    def get_issues(self):
        pass
