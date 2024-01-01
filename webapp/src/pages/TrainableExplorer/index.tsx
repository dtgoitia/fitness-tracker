import { useApp } from "../..";
import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { SearchBox } from "../../components/SearchBox";
import { Trainable, TrainableName, FilterQuery } from "../../lib/domain/model";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import { AddTrainable } from "./AddTrainable";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { filter, first } from "rxjs";
import styled from "styled-components";

export function TrainableExplorer() {
  const app = useApp();
  const trainableManager = app.trainableManager;

  // TODO: store the query filter in the URL
  const [filterQuery, setFilterQuery] = useState<FilterQuery>("");

  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [trainables, setTrainables] = useState<Trainable[]>([]);

  useEffect(() => {
    function _render(): void {
      setTrainables(trainableManager.searchByPrefix(filterQuery));
    }

    const trainableManagerSubscription = app.trainableManager.changes$.subscribe(
      (change) => {
        if (change.kind === "trainable-manager-initialized") {
          setDataLoaded(true);
        }
        _render();
      }
    );

    const appSubscription = app.status$
      .pipe(
        filter(({ kind }) => kind === "app-initialized"),
        first()
      )
      .subscribe((_) => {
        setDataLoaded(true);
        _render();
      });

    _render();

    return () => {
      trainableManagerSubscription.unsubscribe();
      appSubscription.unsubscribe();
    };
  }, [app]);

  function clearSearch(): void {
    setFilterQuery("");
  }

  function handleAddNewTrainable(name: TrainableName): void {
    console.log(
      `TrainableExplorer.handleAddNewTrainable::Adding a new trainable: ${name}`
    );
    trainableManager.add({ name });
  }

  if (dataLoaded === false) {
    return (
      <BlueprintThemeProvider>
        <CenteredPage>
          <NavBar />
          Loading trainables...
        </CenteredPage>
      </BlueprintThemeProvider>
    );
  }

  return (
    <BlueprintThemeProvider>
      <CenteredPage>
        <NavBar />
        <h1>Trainable explorer</h1>

        <AddTrainable add={handleAddNewTrainable} />

        <hr />

        <SearchBox
          query={filterQuery}
          onChange={setFilterQuery}
          clearSearch={clearSearch}
          onFocus={() => {}}
        />
        {trainables.map((trainable) => (
          <OpenTrainableEditor key={trainable.id} trainable={trainable} />
        ))}
      </CenteredPage>
    </BlueprintThemeProvider>
  );
}

const LinkContainer = styled.div`
  margin: 1rem 0;
`;

function OpenTrainableEditor({ trainable }: { trainable: Trainable }) {
  const path = `${Paths.trainables}/${trainable.id}`;

  return (
    <LinkContainer>
      <Link to={path}>{trainable.name}</Link>
    </LinkContainer>
  );
}
