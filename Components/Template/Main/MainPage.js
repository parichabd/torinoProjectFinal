import BookDate from "@/Components/Module/BookDate/BookDate";
import Header from "@/Components/Module/HeaderDate/Header";
import ShowTours from "@/Components/Module/ShowTours/ShowTours";

function MainPage() {
  return (
    <div>
      <Header />
      <BookDate />
      <ShowTours/>
    </div>
  );
}

export default MainPage;
