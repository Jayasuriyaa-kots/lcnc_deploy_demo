import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { FormFieldsListComponent } from '@builder/features/form-builder/components/form-fields-list/form-fields-list.component';
import {
  FORM_BUILDER_TEST_PROVIDERS,
  FORM_BUILDER_TRANSLOCO_TESTING_IMPORT,
} from '@builder/features/form-builder/testing/form-builder-i18n.testing';

describe('FormFieldsListComponent', () => {
  let fixture: ComponentFixture<FormFieldsListComponent>;
  let component: FormFieldsListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldsListComponent, FORM_BUILDER_TRANSLOCO_TESTING_IMPORT],
      providers: FORM_BUILDER_TEST_PROVIDERS,
    }).compileComponents();

    const state = TestBed.inject(FormBuilderFacadeService);
    const form = state.selectedForm();
    fixture = TestBed.createComponent(FormFieldsListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fields', form?.fields ?? []);
    fixture.componentRef.setInput('selectedFieldId', form?.fields[0]?.id ?? null);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit a reorder event when a field is dropped onto a new index', () => {
    const emitSpy = jasmine.createSpy('fieldDropped');
    component.fieldDropped.subscribe(emitSpy);

    const dragEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: jasmine.createSpy('setData'),
      },
    } as unknown as DragEvent;

    component.startDrag(0, dragEvent);
    component.onDrop(2, { preventDefault: jasmine.createSpy('preventDefault') } as unknown as DragEvent);

    expect(emitSpy).toHaveBeenCalledWith({ previousIndex: 0, currentIndex: 2 });
    expect(component.draggedIndex()).toBeNull();
    expect(component.dropTargetIndex()).toBeNull();
  });
});
