import { useApp } from "../..";
import CenteredPage from "../../components/CenteredPage";
import NavBar from "../../components/NavBar";
import { SearchBox } from "../../components/SearchBox";
import { Trainable, TrainableName, FilterQuery } from "../../lib/domain/model";
import { NO_URL_PARAM_VALUE, useUrlParam } from "../../navigation";
import Paths from "../../routes";
import BlueprintThemeProvider from "../../style/theme";
import { AddTrainable } from "./AddTrainable";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { filter, first } from "rxjs";
import styled from "styled-components";

const NO_FILTER_QUERY = "";

export function TrainableExplorer() {
  const app = useApp();
  const trainableManager = app.trainableManager;

  const [filterInUrl, setUrlParam] = useUrlParam({ key: "search" });
  const [filterQuery, setFilterQuery] = useState<FilterQuery>(
    filterInUrl || NO_FILTER_QUERY
  );

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
  }, [app, filterQuery]);

  function handleFilterChange(updated: FilterQuery): void {
    if (updated === filterQuery) {
      return;
    }
    setFilterQuery(updated);
    setUrlParam(updated === NO_FILTER_QUERY ? NO_URL_PARAM_VALUE : updated);
  }

  function clearSearch(): void {
    handleFilterChange("");
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
          onChange={handleFilterChange}
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
