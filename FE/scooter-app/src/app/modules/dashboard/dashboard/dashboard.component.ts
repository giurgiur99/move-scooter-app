import { Component, OnChanges, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { ChartData, ChartOptions } from 'chart.js';
import { CustomerElement } from 'src/app/shared/models/customerElement';
import { CustomerService } from 'src/app/shared/services/customers.service';
import { AdministratorService } from 'src/app/shared/services/administrator.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
  };

  salesData: ChartData<'line'> = {
    labels: [],
    datasets: [{ label: '', data: [], tension: 0.5 }],
  };

  cards = [
    {
      title: 'New customers',
      cols: 2,
      rows: 1,
      data: this.salesData,
      class: 'customer-class',
    },
    { title: 'Card 2', cols: 1, rows: 1 },
    { title: 'Card 3', cols: 1, rows: 1 },
  ];

  constructor(private administratorService: AdministratorService) {}

  async ngOnInit() {
    const customerDates = await this.customerInsights();
    const joinedDates: String[] = customerDates.map(
      (customer) => customer.label
    );
    const joinedDateValues: number[] = customerDates.map(
      (customer) => customer.data
    );

    let salesData = {
      labels: joinedDates,
      datasets: [
        {
          label: 'Customers',
          data: joinedDateValues,
          tension: 0.5,
        },
      ],
    };

    this.cards[0].data = salesData;
  }

  async customerInsights() {
    let customers: CustomerElement[] =
      await this.administratorService.getUsers();
    customers.reverse();
    let customerDates: { label: string; data: number }[] = [];
    for (let i = 0; i < customers.length; i++) {
      if (customers[i].joinedDate) {
        const dateParsed = customers[i].joinedDate.toString().slice(0, 10);

        let newData = { label: dateParsed, data: 0 };
        for (let j = 0; j < customers.length; j++) {
          if (customers[j].joinedDate) {
            let secondDateParsed = customers[j].joinedDate
              .toString()
              .slice(0, 10);
            if (dateParsed === secondDateParsed) {
              newData.data++;
              customers[j].joinedDate = null;
            }
          }
        }
        customerDates.push(newData);
      }
    }

    return customerDates;
  }
}
