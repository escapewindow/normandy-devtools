import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Button,
  ButtonToolbar,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock,
  InputPicker,
} from "rsuite";

import { useSelectedEnvironmentAPI } from "devtools/contexts/environment";
import CodeMirror from "devtools/components/common/CodeMirror";
import FilterObjects from "devtools/components/recipes/FilterObjects";
import JsonEditor from "devtools/components/common/JsonEditor";

export default function RecipeEditor(props) {
  const { match } = props;
  const api = useSelectedEnvironmentAPI();
  const [data, setData] = useState({ arguments: {} });
  const [actions, setActions] = useState([]);
  const [filters, setFilters] = useState({});

  async function getActionsOptions() {
    const res = await api.fetchActions();
    const actions = res.results.map((action) => ({
      label: action.name,
      value: action.id,
    }));

    setActions(actions);
  }

  async function getFilterOptions() {
    const res = await api.fetchFilters();
    const filters = {
      countries: res.countries.map((entry) => {
        return { label: `${entry.key}(${entry.value})`, value: `${entry.key}` };
      }),
      locales: res.locales.map((entry) => {
        return { label: `${entry.key}(${entry.value})`, value: `${entry.key}` };
      }),
    };
    setFilters(filters);
  }
  async function getRecipe(id) {
    const recipe = await api.fetchRecipe(id);
    setData(recipe.latest_revision);
  }

  useEffect(() => {
    getActionsOptions();
    getFilterOptions();
    if (match.params.id) {
      getRecipe(match.params.id);
    }
  }, []);

  const handleActionIDChange = (value) => {
    setData({
      ...data,
      action: {
        ...data.action,
        id: value,
      },
    });
  };
  const handleChange = (key, value) => {
    setData({ ...data, [key]: value });
  };

  const handleSubmit = () => {
    const id = match.params.id;
    try {
      const requestBody = formatRequestBody();

      const requestSave = api.saveRecipe(id, requestBody);

      requestSave
        .then(() => {
          location.replace("/content.html#");
          Alert.success("Changes Saved");
        })
        .catch((err) => {
          Alert.error(`An Error Occurred: ${JSON.stringify(err.data)}`, 5000);
        });
    } catch (err) {
      Alert.error(err.message);
    }
  };

  const formatRequestBody = () => {
    /* eslint-disable no-unused-vars */
    const { comment: _omitComment, ...cleanedData } = data;
    /* eslint-enable no-unused-vars */
    cleanedData.action_id = data.action.id;
    return cleanedData;
  };

  return (
    <div className="page-wrapper">
      <Form fluid formValue={data} onChange={(data) => setData(data)}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl name="name" data-testid="recipeName" />
          <HelpBlock>Required</HelpBlock>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Experimenter Slug</ControlLabel>
          <FormControl name="experimenter_slug" data-testid="experimentSlug" />
        </FormGroup>
        <FilterObjects
          filterObjectData={data.filter_object ? data.filter_object : []}
          countryOptions={filters ? filters.countries : []}
          localeOptions={filters ? filters.locales : []}
          handleChange={handleChange}
        />
        <FormGroup>
          <ControlLabel>Extra Filter Expression</ControlLabel>
          <CodeMirror
            options={{
              mode: "javascript",
              lineNumbers: true,
            }}
            value={data.extra_filter_expression}
            onBeforeChange={(editor, data, value) =>
              handleChange("extra_filter_expression", value)
            }
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Actions</ControlLabel>
          <InputPicker
            name={"actionId"}
            placeholder={"Select an action"}
            data={actions}
            block
            value={data.action ? data.action.id : null}
            onChange={(value) => handleActionIDChange(value)}
          />
        </FormGroup>
        <ActionArgument
          value={data.arguments}
          action={data.action ? data.action.id : null}
          onChange={(newValue) => handleChange("arguments", newValue)}
        />
        <ButtonToolbar>
          <Button appearance="primary" onClick={handleSubmit}>
            Submit
          </Button>
          <Button appearance="default" onClick={() => window.history.go(-1)}>
            Cancel
          </Button>
        </ButtonToolbar>
      </Form>
    </div>
  );
}

RecipeEditor.propTypes = {
  match: PropTypes.object,
};

function ActionArgument({ value, onChange, action }) {
  if (!action) {
    return null;
  }

  return (
    <FormGroup>
      <ControlLabel>Action Arguments</ControlLabel>
      <JsonEditor value={value} onChange={(newValue) => onChange(newValue)} />
    </FormGroup>
  );
}

ActionArgument.displayName = "ActionArgument";
ActionArgument.propTypes = {
  action: PropTypes.number,
  value: PropTypes.object,
  onChange: PropTypes.func.required,
};
