import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Examples } from './example-schemas.model';
import { JsonPointer } from 'angular6-json-schema-form';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'demo',
  templateUrl: 'demo.component.html',
  animations: [
    trigger('expandSection', [
      state('in', style({ height: '*' })),
      transition(':enter', [
        style({ height: 0 }), animate(100),
      ]),
      transition(':leave', [
        style({ height: '*' }),
        animate(100, style({ height: 0 })),
      ]),
    ]),
  ],
})
export class DemoComponent implements OnInit {
  examples: any = Examples;
  selectedSet = 'JSON-Schema';
  selectedSetName = '';
  selectedExample = 'basic-form';
  selectedExampleName = 'Basic Form';
  selectedFramework = 'material-design';
  visible = {
    options: true,
    schema: true,
    form: true,
    output: true
  };

  formActive = false;
  jsonFormSchema: string;
  jsonFormValid = false;
  jsonFormStatusMessage = 'Loading form...';
  jsonFormObject: any;
  liveFormData: any = {};
  formValidationErrors: any;
  formIsValid = null;
  submittedFormData: any = null;
  @ViewChild(MatMenuTrigger, {static: true}) menuTrigger: MatMenuTrigger;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(
      params => {
        if (params['set']) {
          this.selectedSet = params['set'];
          this.selectedSetName = ({
            'JSON-Schema': ''
          })[this.selectedSet];
        }
        if (params['example']) {
          this.selectedExample = params['example'];
          this.selectedExampleName = this.examples[this.selectedSet].schemas
            .find(schema => schema.file === this.selectedExample).name;
        }
        if (params['framework']) {
          this.selectedFramework = params['framework'];
        }
        this.loadSelectedExample();
      }
    );
  }

  onSubmit(data: any) {
    this.submittedFormData = data;
  }

  get prettySubmittedFormData() {
    return JSON.stringify(this.submittedFormData, null, 2);
  }

  isValid(isValid: boolean): void {
    this.formIsValid = isValid;
  }

  validationErrors(data: any): void {
    this.formValidationErrors = data;
  }
  
  loadSelectedExample(
    selectedSet: string = this.selectedSet,
    selectedSetName: string = this.selectedSetName,
    selectedExample: string = this.selectedExample,
    selectedExampleName: string = this.selectedExampleName
  ) {
    if (this.menuTrigger.menuOpen) { this.menuTrigger.closeMenu(); }
    if (selectedExample !== this.selectedExample) {
      this.formActive = false;
      this.selectedSet = selectedSet;
      this.selectedSetName = selectedSetName;
      this.selectedExample = selectedExample;
      this.selectedExampleName = selectedExampleName;
      this.router.navigateByUrl(
        '/?set=' + selectedSet +
        '&example=' + selectedExample
      );
      this.liveFormData = {};
      this.submittedFormData = null;
    }
    const exampleURL = `assets/example-schemas/${this.selectedExample}.json`;
    this.http
      .get(exampleURL, { responseType: 'text' })
      .subscribe(schema => {
        this.jsonFormSchema = schema;
        this.generateForm(this.jsonFormSchema);
      });
  }

  generateForm(newFormString: string) {
    if (!newFormString) { return; }
    this.jsonFormStatusMessage = 'Loading form..';
    this.formActive = true;
    this.liveFormData = {};
    this.submittedFormData = null;

    try {
      // Parse entered content as JSON
      this.jsonFormObject = JSON.parse(newFormString);
    } catch (jsonError) {
      try {
        // If entered content is not valid JSON,
        // parse as JavaScript instead to include functions
        const newFormObject: any = null;
        /* tslint:disable */
        eval('newFormObject = ' + newFormString);
        /* tslint:enable */
        this.jsonFormObject = newFormObject;
      } catch (javascriptError) {

        // If entered content is not valid JSON or JavaScript, show error
        this.jsonFormStatusMessage =
          'Entered content is not currently a valid JSON Form object.\n' +
          'As soon as it is, you will see your form here. So keep typing. :-)\n\n' +
          'JavaScript parser returned:\n\n' + jsonError;
        return;
      }
    }
    this.formActive = true;
  }

  toggleVisible(item: string) {
    this.visible[item] = !this.visible[item];
  }
}
