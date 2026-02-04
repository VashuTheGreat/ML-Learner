import ejs from "ejs";

export default function reder_html(template, temp_data) {
  const html = ejs.render(template, {
    data: temp_data  
  });
  return html;
}
