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
import { Globe } from "lucide-react";

const COUNTRIES = [
  { code: "latam", name: "LATAM", FlagComponent: Globe },
  { code: "do", name: "República Dominicana", FlagComponent: DO },
  { code: "co", name: "Colombia", FlagComponent: CO },
  { code: "mx", name: "México", FlagComponent: MX },
  { code: "ar", name: "Argentina", FlagComponent: AR },
];

interface CountrySelectorProps {
  currentCountry?: string;
}

const CountrySelector = ({ currentCountry }: CountrySelectorProps) => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(currentCountry || "latam");

  useEffect(() => {
    const saved = localStorage.getItem("preferred_country");
    if (saved && !currentCountry) {
      setSelectedCountry(saved);
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
  };

  return (
    <Select value={selectedCountry} onValueChange={handleCountryChange}>
      <SelectTrigger className="w-[200px]">
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
