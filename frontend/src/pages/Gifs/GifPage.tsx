import { Header } from "../../components/Header";
import { GifTable } from "../../components/GifTable/GifTable";
import "./GifPage.scss";
import { useGifs } from "./useGifs";

export const PAGE_SIZE = 10;

export const GifPage = () => {
  const {
    gifs,
    status,
    error,
    saveGif,
    sortOrder,
    toggleSortOrder,
    handleDelete,
    handleLoadMore,
  } = useGifs();

  return (
    <div className="gif-page">
      <div>
        <Header
          onSave={saveGif}
          sortOrder={sortOrder}
          onTogleSortOrder={toggleSortOrder}
        ></Header>
      </div>
      <div>
        <GifTable
          gifs={gifs}
          onDelete={handleDelete}
          onLoadMore={handleLoadMore}
          status={status}
          error={error}
        ></GifTable>
      </div>
    </div>
  );
};
