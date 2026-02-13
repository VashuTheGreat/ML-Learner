import ejs from "ejs";

export default function reder_html(template: string, temp_data: any) {
  const html = ejs.render(template, {
    data: temp_data  
  });
  return html;
}
