import { Button } from "@/components/ui/button";
import { CurrencyInput, Input, NumberInput } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldInfo } from "@/components/ui/form";
import { useForm } from "@tanstack/react-form";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  calculateTotalTakeHomePayWithChildcare,
  ChildCareType,
  cn,
  stringToFloat,
  type CalculateParentalLeaveEntitlement,
} from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import React, { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSavedSearch } from "./saved-search-provider";
const WhatIfAnalysisForm = ({
  defaultValues,
}: {
  defaultValues: CalculateParentalLeaveEntitlement;
}) => {
  const navigate = useNavigate();
  const [result, setResult] = React.useState({
    withChildren: 0,
    childCareCost: 0,
    parentalLeavePayment: 0,
    explanation: "",
  });
  const [modalOpen, setModalOpen] = React.useState(false);
  const form = useForm<CalculateParentalLeaveEntitlement>({
    defaultValues,
    validators: {
      onChange: ({ value }) => {
        const takehome = calculateTotalTakeHomePayWithChildcare(value);
        setResult(takehome);
        navigate({
          search: () => value,
        });
        return undefined;
      },
    },
  });
  const { saveSearch } = useSavedSearch();
  const formState = form.useStore((state) => state.values);
  useEffect(() => {
    Object.entries(defaultValues).forEach(([name, value]) => {
      // @ts-expect-error allow
      form.setFieldValue(name, value);
    });
  }, [defaultValues, form]);
  return (
    <div className="p-4 space-y-4 w-full flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className=" flex flex-col gap-4"
      >
        <div className="flex flex-row gap-4">
          <Person1Section form={form} />
          <Person2Section form={form} />
        </div>
        <div className="flex flex-row gap-4">
          <FamilyDetails form={form} />
          {formState.daysNannyingPerWeek1 + formState.daysNannyingPerWeek2 >
            0 && <NannyingDetails form={form} />}
        </div>
        <div className="flex flex-row gap-4">
          <Button
            onClick={() => {
              setModalOpen(true);
            }}
          >
            Save Search
          </Button>
        </div>
      </form>
      <div>
        <div className="flex flex-row gap-10 pb-4">
          <Card className="grow">
            <CardHeader>
              <CardTitle className="text-center">
                {result.withChildren.toLocaleString("en-AU", {
                  style: "currency",
                  currency: "AUD",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-md text-center">
              Total take home pay after child care
            </CardContent>
          </Card>
          <Card className="grow">
            <CardHeader>
              <CardTitle className="text-center">
                {result.childCareCost.toLocaleString("en-AU", {
                  style: "currency",
                  currency: "AUD",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-md text-center">
              Annual cost of childcare
            </CardContent>
          </Card>
          <Card className="grow">
            <CardHeader>
              <CardTitle className="text-center">
                {result.parentalLeavePayment.toLocaleString("en-AU", {
                  style: "currency",
                  currency: "AUD",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-md text-center">
              Effective value of parental leave for your next child
            </CardContent>
          </Card>
        </div>
        <CollapsibleCard
          title="Explanation"
          description="A breakdown of how we got to this number"
          open={false}
        >
          <div className="p-4">
            <span
              dangerouslySetInnerHTML={{
                __html: result.explanation.trim().replace(/\n/g, "<br>"),
              }}
            />
          </div>
        </CollapsibleCard>
      </div>
      <SaveModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={(name) => {
          saveSearch({
            id: Math.random().toString(),
            name,
            values: formState,
          });
        }}
      />
    </div>
  );
};

const SaveModal = ({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
}) => {
  const form = useForm<{ name: string }>({
    defaultValues: {
      name: "",
    },
    onSubmit: async ({ value }) => {
      onSubmit(value.name);
      onOpenChange(false);
    },
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save search</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="w-full flex flex-col gap-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                value.length === 0 ? "Name is required" : undefined,
            }}
            children={(field) => (
              <>
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                  className="w-full"
                />
                <FieldInfo field={field} />
              </>
            )}
          />
          <DialogFooter>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? "..." : "Save changes"}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const NannyingDetails = ({
  form,
}: {
  form: ReturnType<typeof useForm<CalculateParentalLeaveEntitlement>>;
}) => {
  return (
    <CollapsibleCard
      title="Nannying Details"
      description="One option to spend your days off is to look after another child to help subsidize the family income"
      open={false}
    >
      <div>
        <form.Field
          name="nannyingRate"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? "Nannying Rate is required" : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Nannying Rate</Label>
              <CurrencyInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onNumberChange={(n) => {
                  field.handleChange(n);
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
      <div>
        <form.Field
          name="numberOfChildrenToNanny"
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Number of Children to Nanny</Label>
              <Select
                name={field.name}
                value={field.state.value.toString()}
                onValueChange={(newValue) =>
                  field.handleChange(parseFloat(newValue))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number children you will nanny" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                </SelectContent>
              </Select>
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
    </CollapsibleCard>
  );
};

const FamilyDetails = ({
  form,
}: {
  form: ReturnType<typeof useForm<CalculateParentalLeaveEntitlement>>;
}) => {
  return (
    <CollapsibleCard
      title="Family Details"
      description="Add details for your family situation"
    >
      <div>
        <form.Field
          name="hourlyChildcareRate"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? "Hourly childcare rate is required" : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Hourly childcare rate</Label>
              <CurrencyInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onNumberChange={(n) => {
                  field.handleChange(n);
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
      <div>
        <form.Field
          name="childcareType"
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Childcare Option</Label>
              <Select
                name={field.name}
                value={field.state.value}
                onValueChange={(newValue) =>
                  field.handleChange(newValue as ChildCareType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select childcare option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="centre-based">Centre Based</SelectItem>
                  <SelectItem value="family-day-care">
                    Family day care
                  </SelectItem>
                  <SelectItem value="outside-school-hours">
                    Outside School Hours
                  </SelectItem>
                  <SelectItem value="in-home-care">In home care</SelectItem>
                  <SelectItem value="nannying">Nannying</SelectItem>
                </SelectContent>
              </Select>
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
      <div>
        <form.Field
          name="weeksWithoutChildcare"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? "Weeks without childcare is required" : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Weeks without childcare</Label>
              <NumberInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(stringToFloat(e.target.value));
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
      <div>
        <form.Field
          name="numberOfChildrenInChildcare"
          validators={{
            onChange: ({ value }) =>
              value < 0
                ? "Number of children in childcare is required"
                : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>
                Number of children in childcare
              </Label>
              <NumberInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(stringToFloat(e.target.value));
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
      <div>
        <form.Field
          name="expectingAnotherBaby"
          children={(field) => (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(checked) => {
                    return field.handleChange(checked === true);
                  }}
                />
                <Label htmlFor={field.name}>Expecting another baby</Label>
              </div>
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
    </CollapsibleCard>
  );
};

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const CollapsibleCard = ({
  title,
  description = "Add description",
  open = true,
  children,
}: {
  title: string;
  description?: string;
  open?: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(open);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Card className={cn("w-full h-", isOpen ? "" : "h-24")}>
      <CardHeader>
        <div className="flex flex-row justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button variant="ghost" onClick={handleToggle}>
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      )}
    </Card>
  );
};

const Person1Section = ({
  form,
}: {
  form: ReturnType<typeof useForm<CalculateParentalLeaveEntitlement>>;
}) => {
  return (
    <CollapsibleCard
      title="Person 1"
      description="Add the details for the first parent in your family"
    >
      <div>
        <form.Field
          name="income1"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? "Annual salary is required" : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Annual Pre-tax Salary</Label>
              <CurrencyInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onNumberChange={(n) => {
                  field.handleChange(n);
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>

      <div>
        <form.Field
          name="workHoursPerDay1"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? "Working hours per day is required" : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Working hours per day</Label>
              <NumberInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(stringToFloat(e.target.value));
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>

      <div>
        <form.Field
          name="workDaysPerWeek1"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? "Working days per week is required" : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Working days per week</Label>
              <NumberInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(stringToFloat(e.target.value));
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>

      <div>
        <form.Field
          name="daysOffPerWeek1"
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Days Off Work Per Week</Label>
              <Select
                name={field.name}
                value={field.state.value.toString()}
                onValueChange={(newValue) =>
                  field.handleChange(parseFloat(newValue))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of days off" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="0">0 (Full-time)</SelectItem>
                </SelectContent>
              </Select>
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>

      <div>
        <form.Field
          name="daysNannyingPerWeek1"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? "Days nannying per week is required" : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Days nannying per week</Label>
              <NumberInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(stringToFloat(e.target.value));
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
      <div>
        <form.Field
          name="weeksPaidParentalLeave1"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? "Paid weeks parental leave is required" : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Paid Weeks Parental Leave</Label>
              <NumberInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(stringToFloat(e.target.value));
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
    </CollapsibleCard>
  );
};

const Person2Section = ({
  form,
}: {
  form: ReturnType<typeof useForm<CalculateParentalLeaveEntitlement>>;
}) => {
  return (
    <CollapsibleCard
      title="Person 2"
      description="If you have a second parent in your family, add their details here"
    >
      <div>
        <form.Field
          name="income2"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? "Annual salary is required" : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Annual Pre-tax Salary</Label>
              <CurrencyInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onNumberChange={(n) => {
                  field.handleChange(n);
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>

      <div>
        <form.Field
          name="workHoursPerDay2"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? "Working hours per day is required" : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Working hours per day</Label>
              <NumberInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(stringToFloat(e.target.value));
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>

      <div>
        <form.Field
          name="workDaysPerWeek2"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? "Working days per week is required" : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Working days per week</Label>
              <NumberInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(stringToFloat(e.target.value));
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>

      <div>
        <form.Field
          name="daysOffPerWeek2"
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Days Off Work Per Week</Label>
              <Select
                name={field.name}
                value={field.state.value.toString()}
                onValueChange={(newValue) =>
                  field.handleChange(parseFloat(newValue))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of days off" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="0">0 (Full-time)</SelectItem>
                </SelectContent>
              </Select>
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>

      <div>
        <form.Field
          name="daysNannyingPerWeek2"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? "Days nannying per week is required" : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Days nannying per week</Label>
              <NumberInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(stringToFloat(e.target.value));
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
      <div>
        <form.Field
          name="weeksPaidParentalLeave2"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? "Paid weeks parental leave is required" : undefined,
          }}
          children={(field) => (
            <>
              <Label htmlFor={field.name}>Paid Weeks Parental Leave</Label>
              <NumberInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(stringToFloat(e.target.value));
                }}
                className="w-full"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
    </CollapsibleCard>
  );
};

export default WhatIfAnalysisForm;
