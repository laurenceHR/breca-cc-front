import {Component, OnInit} from '@angular/core';
import {AppService} from './app.service';
import {Chart} from 'angular-highcharts';

@Component({
  selector: 'app-root',
  templateUrl: './breca-cc.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'breca-cc';

  venues: any = [];
  venueSelected: any = {};

  tenants: any = [];
  tenantSelected: any = {};

  countsByDay: any = {};

  years: any = [];
  yearSelected: any = '';
  months: any = [];
  monthSelected: any = '';
  yearMonths: any = {};

  chart: any;

  dataTransit: any = [];
  dataIngress: any = [];

  constructor(private appService: AppService) {}

  ngOnInit() {
    this.appService.getVenues().subscribe((d: any = []) => {
      console.log(d);
      d.forEach(v => this.venues.push(v));
    });
  }

  selectVenue(venue: any = {}) {
    console.log(venue);
    this.venueSelected.id = venue.id;
    this.venueSelected.name = venue.name;
    this.loadTenant(venue.id);
  }

  loadTenant(venueId: number) {
    this.tenants.length = 0;
    this.appService.getVenueTenants(venueId).subscribe((d: any = []) => {
      d.forEach(t => this.tenants.push(t));
    });
  }

  selectTenant(t) {
    console.log(t);
    this.tenantSelected.id = t.tenant_id;
    this.loadCount(t.tenant_id);
  }

  loadCount(tenantId: number) {
    this.years.length = 0;
    this.months.length = 0;
    this.clearObj(this.countsByDay);
    this.clearObj(this.yearMonths);

    this.dataTransit.length = 0;
    this.dataIngress.length = 0;

    this.appService.getTenantCounts(tenantId).subscribe((d: any = []) => {
      d.forEach(c => {
        this.dataTransit.push({x: c.timestamp, y: c.num_transit});
        this.dataIngress.push({x: c.timestamp, y: c.num_ingress});

        if (!this.countsByDay[c.date_year]) {
          this.countsByDay[c.date_year] = {};
          this.years.push(c.date_year);
          this.yearMonths[c.date_year] = [];
        }
        if (!this.countsByDay[c.date_year][c.date_month]) {
          this.countsByDay[c.date_year][c.date_month] = {};
          this.yearMonths[c.date_year].push(c.date_month);
        }
        if (!this.countsByDay[c.date_year][c.date_month][c.date_day]) {
          this.countsByDay[c.date_year][c.date_month][c.date_day] =
          {
            total_transit: 0,
            total_ingress: 0
          };
        }
        this.countsByDay[c.date_year][c.date_month][c.date_day]['total_transit'] += c.num_transit;
        this.countsByDay[c.date_year][c.date_month][c.date_day]['total_ingress'] += c.num_ingress;
      });
      this.buildGraph();
    });
  }

  selectYear(y) {
    console.log(y);
    this.months.length = 0;
    (this.yearMonths[y] || []).forEach(m => this.months.push(m));
  }

  buildGraph() {
    this.chart = new Chart({
      chart: {
        type: 'column',
        inverted: false,
      },
      rangeSelector: {
        selected: 1
      },
      xAxis: {
        type: 'datetime',
      },
      title: {
        text: 'Transit vs Ingress'
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      series: [
        {
          type: 'column',
          name: 'Transit',
          data: this.dataTransit,
          dataGrouping: {
            units: [[
              'minute', // unit name
              [1] // allowed multiples
            ]]
          }
        },
        {
          type: 'column',
          name: 'Ingress',
          data: this.dataIngress
        }
      ]
    });
  }

  clearObj(obj: any = {}) {
    for (const k in obj) {
      if (obj.hasOwnProperty(k)) {
        delete obj[k];
      }
    }
  }
}
