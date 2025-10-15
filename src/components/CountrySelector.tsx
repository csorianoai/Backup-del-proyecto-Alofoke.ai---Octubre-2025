import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COUNTRIES = [
  { code: "latam", name: "LATAM", flag: "🌎" },
  { code: "do", name: "República Dominicana", flag: "🇩🇴" },
  { code: "co", name: "Colombia", flag: "🇨🇴" },
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
        {COUNTRIES.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <span className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountrySelector;
