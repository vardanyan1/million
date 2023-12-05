import { Select as ReactSelect, chakraComponents } from "chakra-react-select"
import { Flex } from "@chakra-ui/react"

export const selectChakraStyles = {
  control: (provided, state) => {
    const {
      selectProps: { overrideStyles = { control: {}, menu: {} } },
    } = state
    return {
      ...provided,
      _focusVisible: {
        ...provided._focusVisible,
        boxShadow: "none",
      },
      borderRadius: 12,
      ...overrideStyles.control,
    }
  },
  dropdownIndicator: (provided, state) => ({
    ...provided,
    background: "none",
  }),
  valueContainer: (css) => ({
    ...css,
    input: { height: 0 },
  }),
  option: (provided, state) => ({
    ...provided,
    color: state.isFocused && "#DD0000",
    backgroundColor: state.isFocused ? "#F7F7F9" : "white",
  }),
  menuList: (provided) => ({
    ...provided,
    borderRadius: 12,
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 999,
  }),
}

const ValueContainer = ({ children, labelLeftComponent, ...rest }) => {
  return (
    <chakraComponents.ValueContainer {...rest}>
      <Flex align={"center"}>
        {labelLeftComponent}
        {children}
      </Flex>
    </chakraComponents.ValueContainer>
  )
}

export const Select = ({ labelLeftComponent, ...props }) => {
  return (
    <ReactSelect
      menuPlacement="auto"
      isSearchable={false}
      focusBorderColor="black"
      components={{
        ValueContainer: (props) => (
          <ValueContainer {...props} labelLeftComponent={labelLeftComponent} />
        ),
        IndicatorSeparator: null,
      }}
      {...props}
      chakraStyles={selectChakraStyles}
    />
  )
}
