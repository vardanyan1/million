import { extendTheme } from "@chakra-ui/react"

const theme = extendTheme({
    components: {
      Input: {
        sizes: {
          md: {
            field: {
              borderRadius: 12
            }
          }
        }
      },
      Button: {
        baseStyle: {
          borderRadius: 12
        }
      },
      Checkbox: {
        baseStyle: {
          control: {
            borderRadius: 6
          }
        }
      }
    },
    fonts: {
      heading: `'Nunito Sans', sans-serif`,
      body: `'Nunito Sans', sans-serif`,
    },
    styles: {
      global: {
        body: {
          minHeight: '100vh'
        },
        '.datepicker-wrapper': {
          borderRadius: 12,
          boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.15)',
        },
        '.alert-wrapper .react-datepicker .react-datepicker__day': {
            color: 'black'
        },
        '.react-datepicker-popper': {
          zIndex: 3,
        },
        '.alert-wrapper .react-datepicker .react-datepicker__day--disabled': {
          color: '#B3B4B9'
        },
        '.alert-wrapper .react-datepicker__day.react-datepicker__day--in-range': {
          color: 'white',
          borderRadius: '50%',
          backgroundColor: '#6A6E85'
        },
        '.alert-wrapper .react-datepicker__day.react-datepicker__day--in-selecting-range': {
          color: 'white',
          borderRadius: '50%',
          backgroundColor: '#6A6E85'
        },
        '.alert-wrapper .react-datepicker__day:hover': {
          borderRadius: '50%',
        },
        '.react-datepicker': {
          border: 'none',
          '.react-datepicker__header': {
            borderBottom: 0,
            backgroundColor: '#F7F7F9',
            paddingTop: '20px',
          },
          '.react-datepicker__day': {
            width: '45px',
            lineHeight: '45px',
            color: '#B3B4B9'
          },
          ".react-datepicker__day-name": {
            width: '45px',
            color: '#6A6E85',
            fontWeight: 'bold',
            fontSize: '12px'
          },
          '.react-datepicker__day--selected': {
            // backgroundColor: '#DD0000',
            backgroundColor: 'transparent',
            borderRadius: '50%',
            // color: '#FFFFFF;',
          },
          '.react-datepicker__current-month': {
            color: '#141725',
            marginBottom: '10px',
          },
          '.react-datepicker__navigation': {
            top: '20px'
          },
          '.react-datepicker__navigation-icon::before': {
            height: '7px',
            width: '7px',
            borderWidth: '2px 2px 0 0',
            borderColor: '#6A6E85',
          },
          '.color-wheel': {
            borderRadius: '50%',
            color: '#141725',
          },
          '.react-datepicker__day--selected .color-wheel': {
            color: 'white',
          },
          '.color-wheel::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            borderRadius: '50%',
            background: 'white',
            width: '70%',
            height: '70%',
            transform: 'translate(-50%, -50%)',
          },
          '.react-datepicker__day--selected .color-wheel::after': {
            background: '#6A6E85;',
          }
        }
      }
    }
  })

export default theme