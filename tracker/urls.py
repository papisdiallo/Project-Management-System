from django.urls import path
from . import views as tracker_views

urlpatterns = [
    path("create_site/", tracker_views.create_site, name="site_creation"),
    path("<slug:site_slug>/dashboard/",
         tracker_views.DashbaordView.as_view(), name="dashbaord"),
]
