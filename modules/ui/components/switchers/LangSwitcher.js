import { changeLanguage } from "@/modules/settings/redux/lang/languageSlice"
import BaseSwitcher from "./BaseSwitcher"

const options = [
  {
    value: "en",
    label: "English",
  },
  {
    value: "ru",
    label: "Русский",
  },
]

const LangSwitcher = () => {
  return <BaseSwitcher
    options={options}
    setVal={changeLanguage}
    defaultVal={options[0].value}
    selector={(state) => state.lang.language}
  />
}

export default LangSwitcher