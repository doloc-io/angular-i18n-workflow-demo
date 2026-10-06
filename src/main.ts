import { bootstrapApplication } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
@Component({ selector: 'app-root', standalone: true, templateUrl: './app.html' })
class App { readonly reminded = signal(false); }
bootstrapApplication(App).catch(console.error);
