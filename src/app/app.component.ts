import {
  Compiler,
  Component,
  Injector,
  NgModule,
  NgModuleRef,
  ViewChild,
  ViewContainerRef,
  OnInit,
  ComponentFactoryResolver,
  
} from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { FlexLayoutModule } from "@angular/flex-layout";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  componentB = null;
  componentGeneratorForm: FormGroup;
  componentText: string = "";
  componentTemplateCode: string = "";

  @ViewChild("vc", { static: true, read: ViewContainerRef })
  _container: ViewContainerRef;
  constructor(
    private _compiler: Compiler,
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
    if (this.componentB) {
      this.componentB.instance.Testtext =  this.componentText;
    }
  }

  CreateComponent() {
    const template = this.generateMarkupForComponent();

    const componentB = Component({ template: template})(
      class {

        Testtext: string = "";
      }
    );
    const bModule = NgModule({
      declarations: [componentB],
      imports: [FlexLayoutModule]
    })(class {});

    this._container.clear();

    this._compiler
      .compileModuleAndAllComponentsAsync(bModule)
      .then(factories => {
        const factory = factories.componentFactories[0];
        this.componentB = this._container.createComponent(factory);
        this.componentB.instance.Testtext = this.componentText;
        this._container.insert(this.componentB.hostView);
      });
  }

  generateMarkupForComponent(){

  let markup = "<div   fxLayout='row'  fxLayout.xs='column' fxLayoutGap='1%' fxLayoutAlign='center center'>" +
      "<div class='divComponentB'  fxFlex='50%'>" +
      " <div fxLayout='row' fxLayoutAlign='center center'> {{a}}" +
      "<label class='cardTitle'>Component B " +
      " </label>" +
      " </div> " +
      " <div fxLayout='row' fxLayoutAlign='center center'> " +
      this.componentTemplateCode +
      " </div> " +
      "</div>" +
      "</div>";

      return markup;
  }

  isValidMarkup(tag) {
    var isvalid = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/.test(tag);
    return isvalid;
  }
}
