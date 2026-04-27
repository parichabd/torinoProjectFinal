"use client";
import { useState } from "react";
import Header from "@/Components/Module/HeaderDate/Header";
import BookDate from "@/Components/Module/BookDate/BookDate";
import ShowTours from "@/Components/Module/ShowTours/ShowTours";
import PhoneReseved from "@/Components/Module/Static/PhoneReseved";
import TourSlider from "@/Components/Module/Static/TourSlider";
import WebInfo from "@/Components/Module/Static/WebInfo";

export default function MainPage() {
  const [displayedTours, setDisplayedTours] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div>
      <Header />
      <BookDate 
        setFoundTours={setDisplayedTours} 
        setIsLoading={setIsLoading}
        setHasError={setHasError}
      />
      <ShowTours 
        tours={displayedTours} 
        isLoading={isLoading}
        hasError={hasError}
      />
      <PhoneReseved />
      <TourSlider />
      <WebInfo />
    </div>
  );
}