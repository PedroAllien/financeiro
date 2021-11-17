import { AfterContentChecked, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { switchMap } from "rxjs/operators";

import toastr from "toastr";
import { BaseResourceModel } from '../../models/base-resourse.model';
import { BaseResourceService } from '../../services/base-resource.service';


export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  currentAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
   
  private route: ActivatedRoute;
  private router: Router;
  private formBuilder: FormBuilder;

  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T,
  ) {
      this.route = this.injector.get(ActivatedRoute);
      this.router = this.injector.get(Router);
      this.formBuilder = this.injector.get(FormBuilder);
   }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
    
  }

  ngAfterContentChecked(){
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;

    if(this.currentAction == "new"){
      this.createResource();
    }else{
      this.updateResource();
    }

  }

  
  //PRIVATE METHODS

  protected setCurrentAction(){
    if(this.route.snapshot.url[0].path == "new" ){
      this.currentAction = "new";
    }else {
      this.currentAction = "edit";
    }
  }

  protected loadResource(){
    if(this.currentAction == "edit") {
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get("id")))
      )
      .subscribe(
        (resource) => {
          this.resource = resource;
          this.resourceForm.patchValue(resource);
        },
        (error) => alert("Ocorreu um erro no servidor.")
      )
    }
  }
  
  protected setPageTitle(){
    if(this.currentAction == "new"){
      this.pageTitle = this.creationPageTitle();
    } else{
      this.pageTitle = this.editionPageTitle();
    }
  }

  protected creationPageTitle(){
    return "Novo"
  }

  protected editionPageTitle(){
    return "Edição"
  }

  protected createResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value)

    this.resourceService.create(resource).subscribe(
      resource => this.actionsForSuccess(resource),
      error => this.actionsForError(error)
    )

  }

  protected updateResource(){
    const category: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.update(this.resource).subscribe(
      resource => this.actionsForSuccess(resource),
      error => this.actionsForError(error)
    )
  }

  protected actionsForSuccess(resource: T){
    toastr.success("Solicitação processada com Sucesso");

    const basComponentPath: string = this.route.snapshot.parent.url[0].path;

    this.router.navigateByUrl(basComponentPath, {skipLocationChange: true}).then(
      () => this.router.navigate([basComponentPath, resource.id, "edit"])
    )

  }

  protected actionsForError(error){
    toastr.error("Ocorreu um erro!");
    this.submittingForm = false;

    if(error.status === 422){
      this.serverErrorMessages =  JSON.parse(error._body).errors;
    }else{
      this.serverErrorMessages = ["Falha na comunicação como servidor"]
    }

  }

  protected abstract buildResourceForm(): void;
}