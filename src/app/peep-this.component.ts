import { Component } from '@angular/core';

@Component({
    selector: 'app-peep-this',
    template: '<h1>{{title}}</h1>',
    styles: [`
    h1 {
        color: blue;
    }`]
})

export class PeepThisComponent {
    title = 'Peep This';
}