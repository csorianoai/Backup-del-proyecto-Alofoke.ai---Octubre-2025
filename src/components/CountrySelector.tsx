import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DO } from 'country-flag-icons/react/3x2';
import { CO } from 'country-flag-icons/react/3x2';
import { MX } from 'country-flag-icons/react/3x2';
import { AR } from 'country-flag-icons/react/3x2';
import { ES } from 'country-flag-icons/react/3x2';
import { PE } from 'country-flag-icons/react/3x2';
import { PA } from 'country-flag-icons/react/3x2';
import { CL } from 'country-flag-icons/react/3x2';
import { UY } from 'country-flag-icons/react/3x2';
import { Globe } from "lucide-react";

const COUNTRIES = [
  { code: "latam", name: "LATAM", FlagComponent: Globe },
  { code: "do", name: "República Dominicana", FlagComponent: DO },
  { code: "co", name: "Colombia", FlagComponent: CO },
  { code: "mx", name: "México", FlagComponent: MX },
  { code: "ar", name: "Argentina", FlagComponent: AR },
  { code: "es", name: "España", FlagComponent: ES },
  { code: "pe", name: "Perú", FlagComponent: PE },
  { code: "pa", name: "Panamá", FlagComponent: PA },
  { code: "cl", name: "Chile", FlagComponent: CL },
  { code: "uy", name: "Uruguay", FlagComponent: UY },
];

interface CountrySelectorProps {
  currentCountry?: string;
  onSelect?: () => void;
}

const CountrySelector = ({ currentCountry, onSelect }: CountrySelectorProps) => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(currentCountry || "latam");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("preferred_country");
    if (saved && !currentCountry) {
      setSelectedCountry(saved);
    }
  }, [currentCountry]);

  // Keep selector in sync with the route-provided country
  useEffect(() => {
    if (currentCountry) {
      setSelectedCountry(currentCountry);
    } else if (!currentCountry && !localStorage.getItem("preferred_country")) {
      setSelectedCountry("latam");
    }
  }, [currentCountry]);

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    localStorage.setItem("preferred_country", value);
    
    if (value === "latam") {
      navigate("/latam");
    } else {
      navigate(`/pais/${value}`);
    }
    
    // Close the select dropdown
    setOpen(false);
    
    // Close mobile menu if callback provided
    onSelect?.();
  };

  return (
    <Select value={selectedCountry} onValueChange={handleCountryChange} open={open} onOpenChange={setOpen}>
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {COUNTRIES.map((country) => {
          const FlagComponent = country.FlagComponent;
          return (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                {country.code === "latam" ? (
                  <FlagComponent className="w-4 h-4" />
                ) : (
                  <FlagComponent className="w-6 h-4" />
                )}
                <span>{country.name}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default CountrySelector;
