import { AddGif } from "../../components/AddGif";
import { GifTable } from "../../components/GifTable/GifTable";
import "./GifPage.scss";
import { useGifs } from "./useGifs";

export const PAGE_SIZE = 5;

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

  switch (status) {
    case "loading":
      return <div>Loading</div>;

    case "saving":
      return <div>Saving</div>;

    case "deleting":
      return <div>Deleting</div>;

    case "error":
      return <div>{error}</div>;
    default:
      break;
  }

  return (
    <div className="gif-page">
      <div>
        <AddGif onSave={saveGif}></AddGif>
      </div>
      <div>
        <GifTable
          gifs={gifs}
          onTogleSortOrder={toggleSortOrder}
          sortOrder={sortOrder}
          onDelete={handleDelete}
          onLoadMore={handleLoadMore}
        ></GifTable>
      </div>
    </div>
  );
};
