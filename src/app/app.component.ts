import {Compiler, Component, Injector, NgModule, NgModuleRef, ViewChild, ViewContainerRef,OnInit, Type} from "@angular/core";
import {FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppMaterialModule } from './material-module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit  {
  
  componentGeneratorForm: FormGroup;
  componentText: string = '';
  componentTemplateCode : string = '';

  @ViewChild('vc', {static: true, read: ViewContainerRef}) _container: ViewContainerRef;
  constructor(private _compiler: Compiler,
              private _injector: Injector,
              private _m: NgModuleRef<any>,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
  
    this.componentGeneratorForm = this.formBuilder.group({
     
      'componentText': [null, Validators.required],
      'componentTemplateCode': [null, Validators.required],
      
    });
   
  }

  onFormSubmit(form: NgForm) {
  
    var componentText = this.componentGeneratorForm.value.componentText;
    var componentTemplateCode = this.componentGeneratorForm.value.componentTemplateCode;

    this.CreateComponent(componentText,componentTemplateCode);
  }

  CreateComponent(componentText,componentTemplateCode) {

    

    const template = "<div  fxLayout='row'  fxLayout.xs='column' fxLayoutGap='1%' fxLayoutAlign='center center'>" +
                      "<div fxFlex='50%'>" +
                      " <div fxLayout='row' fxLayoutAlign='center center'> " +
                      "<label class='cardTitle'>Component B " +
                      " </label> " +
                      " </div> "+
                      componentTemplateCode + 
                      //`${componentTemplateCode}` + 
                      "</div>" +
                      "</div>";

                      
      const tmpCmp = Component({template: template})(class {
      });
      const tmpModule = NgModule({declarations: [tmpCmp],imports: [FlexLayoutModule]} )(class {
      });

      this._compiler.compileModuleAndAllComponentsAsync(tmpModule)
          .then((factories) => {
              const f = factories.componentFactories[0];
              const cmpRef = f.create(this._injector, [], null, this._m);
              cmpRef.instance.Testtext = componentText;
              this._container.insert(cmpRef.hostView);
          })
  }

  
 
}
