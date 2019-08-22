import React, { useState } from "react"
import Button from "@material-ui/core/Button"
import { useQuery } from "@apollo/react-hooks"
import { gql } from "apollo-boost"
import _ from "lodash"

import SearchBox from "../../components/SearchBox"
import PokemonCard from "../../components/PokemonCard"
import MultipleSelect from "../../components/MultipleSelect"
import Checkbox from "../../components/Checkbox"
import * as S from "./styled"

import { loadState, saveState } from "../../helpers/stateHelpers"

export default function HomeScreen() {
  const typeState = loadState("type");
  const weaknessState = loadState("weakness");
  const strictTypeState = loadState("strictType");

  const [type, setType] = useState(typeState ? typeState : []);
  const [weakness, setWeakness] = useState(weaknessState ? weaknessState : []);
  const [strictType, setStrictType] = useState(
    strictTypeState ? strictTypeState : false
  );

  function handleTypeChange(data) {
    setType(data);
    saveState("type", data);
  }

  function handleWeaknessChange(data) {
    setWeakness(data);
    saveState("weakness", data);
  }

  function handleStrictTypeChange(data) {
    setStrictType(data);
    saveState("strictType", data);
  }

  function handleClearType() {
    handleTypeChange([]);
    handleStrictTypeChange(false);
  }

  const { loading, error, data } = useQuery(gql`
    {
      pokemonMany {
        name
        num
        img
        type
        weaknesses
      },
      types {
        types
      }
    }
  `);
  if (loading)
    return (
      <S.Container>
        <p>Loading...</p>
      </S.Container>
    );
  if (error)
    return (
      <S.Container>
        <p>Error :(</p>
      </S.Container>
    );
  return (
    <S.Container>
      <h1>Pokédex</h1>
      <SearchBox
        suggestions={data.pokemonMany.map(pokemon => ({
          label: pokemon.name,
          value: pokemon.num
        }))}
      >
        {searchValue => (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-evenly"
              }}
            >
              <div style={{ display: "flex" }}>
                <MultipleSelect
                  options={data.types[0].types}
                  label="Types"
                  handleChange={handleTypeChange}
                  value={type}
                />
                <div style={{ alignSelf: "flex-end", paddingBottom: 12 }}>
                  <Checkbox
                    label="Strict Type Match"
                    checked={strictType}
                    handleChange={handleStrictTypeChange}
                  />
                </div>
              </div>
              <MultipleSelect
                options={data.types[0].types}
                label="Weaknesses"
                handleChange={handleWeaknessChange}
                value={weakness}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around"
              }}
            >
              <Button onClick={handleClearType}>Clear Type Filter</Button>
              <Button onClick={() => handleWeaknessChange([])}>Clear Weakness Filter</Button>
            </div>
            <S.Grid>
              {data.pokemonMany
                .filter(pokemon =>
                  searchValue
                    ? _.deburr(pokemon.name.toLowerCase()).includes(
                        _.deburr(searchValue.toLowerCase())
                      )
                    : true
                )
                .filter(pokemon =>
                  type.length
                    ? strictType
                      ? type.every(t => pokemon.type.indexOf(t) > -1)
                      : pokemon.type.some(t => type.includes(t))
                    : true
                )
                .filter(pokemon =>
                  weakness.length
                    ? pokemon.weaknesses.some(w => weakness.includes(w))
                    : true
                )
                .map(pokemon => (
                  <S.CardContainer key={pokemon.num}>
                    <S.CardLink to={`/${pokemon.num}`}>
                      <PokemonCard
                        key={pokemon.num}
                        pokemon={pokemon}
                        isSmall
                        animateHovering
                      />
                    </S.CardLink>
                  </S.CardContainer>
                ))}
            </S.Grid>
          </>
        )}
      </SearchBox>
    </S.Container>
  );
}
