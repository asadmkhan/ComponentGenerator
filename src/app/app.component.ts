import {
  Compiler,
  Component,
  Injector,
  NgModule,
  NgModuleRef,
  ViewChild,
  ViewContainerRef,
  OnInit,
  Type,
  ComponentFactoryResolver
} from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { FlexLayoutModule } from "@angular/flex-layout";
import { AppMaterialModule } from "./material-module";
import { validator } from "html-validator";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  componentRef = null;
  componentGeneratorForm: FormGroup;
  componentText: string = "";
  componentTemplateCode: string = "";

  @ViewChild("vc", { static: true, read: ViewContainerRef })
  _container: ViewContainerRef;
  constructor(
    private _compiler: Compiler,
    private _injector: Injector,
    private _m: NgModuleRef<any>,
    private formBuilder: FormBuilder,
    private resolver: ComponentFactoryResolver
  ) {}

  ngOnInit() {
    this.componentGeneratorForm = this.formBuilder.group({
      componentText: [null, Validators.required],
      componentTemplateCode: [null, Validators.required]
    });
  }

  onFormSubmit(form: NgForm) {
    var markupToCheck = this.componentTemplateCode.replace("{{Testtext}}", "");
    var isValidMarkup = this.isValidMarkup(markupToCheck);
    var doesExpressionExists =
      this.componentTemplateCode.indexOf("Testtext") >= 0;

    if (doesExpressionExists && isValidMarkup) {
      this.CreateComponent();
    } else if (!doesExpressionExists) {
      alert('Please use "Testtext" as binding property in template code');
    } else if (!isValidMarkup) {
      alert("HTML is not valid");
    }
  }

  updateComponentValue() {
    if (this.componentRef) {
      this.componentRef.instance.Updater(this.componentText);
    }
  }

  CreateComponent() {
    const template =
      "<div  fxLayout='row'  fxLayout.xs='column' fxLayoutGap='1%' fxLayoutAlign='center center'>" +
      "<div fxFlex='50%'>" +
      " <div fxLayout='row' fxLayoutAlign='center center'> " +
      "<label class='cardTitle'>Component B " +
      " </label>" +
      " </div> " +
      " <div fxLayout='row' fxLayoutAlign='center center'> " +
      this.componentTemplateCode +
      " </div> " +
      "</div>" +
      "</div>";

    const tmpCmp = Component({ template: template })(
      class {
        Testtext: string = "My New Value";
      }
    );
    const tmpModule = NgModule({
      declarations: [tmpCmp],
      imports: [FlexLayoutModule]
    })(class {});

    this._container.clear();

    this._compiler
      .compileModuleAndAllComponentsAsync(tmpModule)
      .then(factories => {
        const f = factories.componentFactories[0];
        this.componentRef = this._container.createComponent(f);
        this.componentRef.instance.Testtext = this.componentText;
        this.componentRef.instance.Updater = function(updatedValue) {
          this.Testtext = updatedValue;
        };
        this._container.insert(this.componentRef.hostView);
      });
  }

  isValidMarkup(tag) {
    var isvalid = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/.test(tag);
    return isvalid;
  }
}
