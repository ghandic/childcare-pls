import { createFileRoute, useNavigate } from "@tanstack/react-router";
import WhatIfAnalysisForm from "@/components/ccs-form";
import * as z from "zod";
import { useState } from "react";
import {
  SavedSearchProvider,
  useSavedSearch,
} from "@/components/saved-search-provider";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Search, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultValuesSchema = z.object({
  income1: z.number().default(92000),
  income2: z.number().default(92000),
  workHoursPerDay1: z.number().default(8),
  workHoursPerDay2: z.number().default(8),
  workDaysPerWeek1: z.number().default(5),
  workDaysPerWeek2: z.number().default(5),
  daysOffPerWeek1: z.number().default(0),
  daysOffPerWeek2: z.number().default(0),
  hourlyChildcareRate: z.number().default(18.75),
  childcareType: z
    .enum([
      "centre-based",
      "family-day-care",
      "outside-school-hours",
      "in-home-care",
      "nannying",
    ])
    .default("family-day-care"),
  nannyingRate: z.number().default(35),
  numberOfChildrenToNanny: z.number().default(1),
  daysNannyingPerWeek1: z.number().default(0),
  daysNannyingPerWeek2: z.number().default(0),
  weeksWithoutChildcare: z.number().default(4),
  numberOfChildrenInChildcare: z.number().default(1),
  weeksPaidParentalLeave1: z.number().default(14),
  weeksPaidParentalLeave2: z.number().default(14),
  expectingAnotherBaby: z.boolean().default(true),
});

export const Route = createFileRoute("/")({
  validateSearch: defaultValuesSchema,
  component: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const defaultValues = Route.useSearch();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(false);
    return (
      <SavedSearchProvider>
        <div className="flex flex-row w-full min-h-[100vh]">
          <div
            className={cn(
              "bg-muted fixed h-[100vh]",
              open ? "w-[250px] " : "w-[50px] "
            )}
          >
            <SavedSearches open={open} onOpenChange={setOpen} />
          </div>
          <div
            className={cn(
              "w-full flex flex-col gap-4 p-4",
              open ? "pl-[250px]" : "pl-[50px]"
            )}
          >
            <h1 className="font-bold text-3xl text-center">
              What should we do for childcare!?
            </h1>
            <WhatIfAnalysisForm defaultValues={defaultValues} />
          </div>
        </div>
      </SavedSearchProvider>
    );
  },
});

const SavedSearches = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  // pull saved names and state from localstorage
  const { savedSearches, deleteSearch } = useSavedSearch();
  const navigate = useNavigate();
  const [currentlyViewed, setCurrentlyViewed] = useState<string>();

  if (!open) {
    return (
      <div>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 absolute top-4 right-[10px] "
          onClick={() => onOpenChange(true)}
        >
          <Search className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2 mt-16 items-center">
          {savedSearches.map((search, index) => (
            <Button
              variant={currentlyViewed === search.id ? "default" : "outline"}
              key={index}
              className="h-8 w-8"
              onClick={() => {
                setCurrentlyViewed(search.id);
                navigate({
                  search: () => search.values,
                });
              }}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="font-bold text-xl text-center">Saved Searches</h1>
      <Button
        size="icon"
        variant="outline"
        onClick={() => {
          onOpenChange(false);
        }}
        className="absolute top-4 right-3 h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex flex-col gap-2 pt-4">
        {savedSearches.map((search, index) => (
          <div className="flex flex-row gap-2">
            <Button
              variant={currentlyViewed === search.id ? "default" : "outline"}
              key={index}
              onClick={() => {
                setCurrentlyViewed(search.id);
                navigate({
                  search: () => search.values,
                });
              }}
              className="w-full"
            >
              {search.name.slice(0, 18)}
              {search.name.length > 18 ? "..." : ""}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="p-2"
              onClick={() => {
                deleteSearch(search.id);
              }}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
