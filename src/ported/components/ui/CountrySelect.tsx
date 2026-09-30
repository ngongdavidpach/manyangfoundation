import React, { useEffect, useState } from "react";

interface Country {
  name: string;
  code: string;
}

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  placeholder = "Search or select a country...",
  label = "Country",
  required = false,
  id = "country-select",
  name = "country",
  className = "",
}) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const datalistId = `${id}-datalist`;

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2");

        if (!response.ok) {
          throw new Error(`Failed to fetch countries: ${response.status}`);
        }

        const data = await response.json();

        // Extract and sort country names
        const countryList: Country[] = data
          .map((country: any) => ({
            name: country.name?.common || "",
            code: country.cca2?.toLowerCase() || "",
          }))
          .filter((country: Country) => country.name && country.code)
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        

        setCountries(countryList);
        setError(null);
      } catch (err) {
        console.error("Error fetching countries:", err);
        setError("\n");
        // Fallback to a basic list of common countries
        setCountries([
          { name: "Afghanistan", code: "af" },
          { name: "Albania", code: "al" },
          { name: "Algeria", code: "dz" },
          { name: "Andorra", code: "ad" },
          { name: "Angola", code: "ao" },
          { name: "Argentina", code: "ar" },
          { name: "Australia", code: "au" },
          { name: "Austria", code: "at" },
          { name: "Bangladesh", code: "bd" },
          { name: "Belgium", code: "be" },
          { name: "Brazil", code: "br" },
          { name: "Cameroon", code: "cm" },
          { name: "Canada", code: "ca" },
          { name: "China", code: "cn" },
          { name: "Democratic Republic of the Congo", code: "cd" },
          { name: "Denmark", code: "dk" },
          { name: "Egypt", code: "eg" },
          { name: "Ethiopia", code: "et" },
          { name: "France", code: "fr" },
          { name: "Germany", code: "de" },
          { name: "Ghana", code: "gh" },
          { name: "India", code: "in" },
          { name: "Indonesia", code: "id" },
          { name: "Italy", code: "it" },
          { name: "Japan", code: "jp" },
          { name: "Kenya", code: "ke" },
          { name: "Mexico", code: "mx" },
          { name: "Netherlands", code: "nl" },
          { name: "Nigeria", code: "ng" },
          { name: "Pakistan", code: "pk" },
          { name: "Philippines", code: "ph" },
          { name: "Poland", code: "pl" },
          { name: "Russia", code: "ru" },
          { name: "South Africa", code: "za" },
          { name: "South Korea", code: "kr" },
          { name: "Spain", code: "es" },
          { name: "Sweden", code: "se" },
          { name: "Switzerland", code: "ch" },
          { name: "Tanzania", code: "tz" },
          { name: "Turkey", code: "tr" },
          { name: "Uganda", code: "ug" },
          { name: "United Kingdom", code: "gb" },
          { name: "United States", code: "us" },
          { name: "Vietnam", code: "vn" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center pl-3 pointer-events-none text-slate-400 text-xs">
            Loading countries…
          </div>
        )}
        <input
          type="text"
          id={id}
          name={name}
          list={datalistId}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete="off"
          className={`
            w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900
            focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            ${loading ? "text-slate-400" : ""}
            ${error ? "border-amber-300 bg-amber-50" : ""}
          `}
          disabled={loading}
        />
        <datalist id={datalistId}>
          {countries.map((country) => (
            <option key={country.code} value={country.name} />
          ))}
        </datalist>
        {error && !loading && (
          <p className="mt-1 text-xs text-amber-700">{error}</p>
        )}
      </div>
    </div>
  );
};
