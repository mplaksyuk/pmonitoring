$(function() {

    var count_of_stages = 0;
    var count_of_tasks = 0;

    function add_user(u,user){
        $("#t-user").contents().clone().appendTo(u)
        .find('.firstname').val(user.fname).end()
        .find('.lastname').val(user.lname).end();

    }
    function create_user(users_block,user){
        $("#t-hidden-user").contents().clone()
        .appendTo(users_block.find('.content_users'))
        .find('.content_user_fname').val(user.fname).end()
        .find('.content_user_lname').val(user.lname).end()
        .find('.content_user_position').val(user.position).end();
    }

    function create_content(c, task){
        const users_block = $("#t-content").contents().clone()
            .appendTo(c.find('.content-block'))
            .data('task', task) 
            .find('.content_task_id').val(task.task_id).end()
            .find('.content_id').val(task._id).end()
            .find('.content-name').text(task.title).end()
            .find('.content_description').val(task.description).end()
            .find('.content_stage').val(c.find('.column_id').val()).end();
        
        count_of_tasks++;
        task.users.forEach(user => create_user(users_block, user));
        
    }

    function create_column(stage) {
        const c = $("#t-column").contents().clone()
            .appendTo("#column-block")
            .find('.column-title').val(stage.title).end()
            .find('.column_id').val(stage._id).end()
            .find('.column_order').val(stage.order).end()
            .find(".content-block").sortable({
                connectWith:'.content-block',
                stop: function(event, ui) {
                    console.log(ui.item);
                    const stage = $(ui.item).closest('.column').find('.column_id').val();

                    const id = $(ui.item).find('.content_id').val();
                    const title = $(ui.item).find('.content-name').text();
                    const description = $(ui.item).find('.content_description').val();
                    const task_id = $(ui.item).find('.content_task_id').val();
                    const users = $(ui.item).find('.content_user_data').map(function(){
                        const user = $(ui.item);
                        return {
                            fname:user.find('.content_user_fname').val(),
                            lname:user.find('.content_user_lname').val()};
                    }).get();
                    const task = {
                        id: id,
                        title: title,
                        description: description,
                        users: users,
                        stage: stage,
                        task_id: parseInt(task_id)
                    }
                    if(id != "")
                    $.ajax('/api/set/', {
                        contentType: 'application/json; charset=UTF-8',
                        data: JSON.stringify(task),
                        method: 'POST'
                    })
                }
            }).end();

        if(!stage._id){
            $.ajax('/api/post/stage/', {
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify({
                    title: stage.title,
                    order: stage.order
                }),
                method: 'POST'
            }).done(function(value_id){
                console.log(value_id);
                c.find('.column_id').val(value_id).end();
            });
        }


        stage.tasks.forEach(task => create_content(c, task));
        count_of_stages++;
    };

    

    $('#workspace').on( 'click','.button',function(event){
        const link = $(this).closest(".column");
        create_content(link,{"task_id": count_of_tasks});
        
    });

    $('#workspace').on('change','.column-title',function(){
        console.log('11232');
        const id = $(this).closest('.column').find('.column_id').val();
        const title = $(this).val();
        const order = $(this).closest('.column').find('.column_order').val();

        const stage = {
            id: id,
            title: title,
            order: order
        }
        $.ajax('/api/post/stage/', {
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(stage),
            method: 'POST'
        });
    });

    $('#add-column').on('click',function(){
        
       create_column({
           "title":"title",
            "order":count_of_stages
       });

    }) ;

    $('#edit-column').on('click',function(){
        // $(".content-trash").css({
        //     'display':"none"
        // })
        const color = $('.edit-button').css("background-color");
        switch(color){
            case "rgb(242, 242, 242)":
                $('.edit-button').css({"background-color":"rgba(89, 190, 89, 0.431)"})
                break;
            default:
                $('.edit-button').css({"background-color":"rgb(242, 242, 242)"})
                break;
        }
        toggleFunction() 
    });

    function toggleFunction() {
        $(".content-trash").toggleClass("display-none");    
        const bool = $(".add-content-btn").attr("disabled");
        switch(bool){
            case 'disabled':
                $(".add-content-btn").removeAttr('disabled');
                $("#add-column").removeAttr('disabled');
                $(".content-button-trash").attr('disabled','disabled');
                $(".btn-text").css({
                    "color": "black"
                })
                break;
            default:
                $(".add-content-btn").attr('disabled','disabled');
                $("#add-column").attr('disabled','disabled');
                $(".content-button-trash").removeAttr('disabled');
                $(".btn-text").css({
                    "color": "#BDBDBD"
                })
                break;
        }
        
    }

    $(document).on('click','.content-button-trash',function(){
        
        $('.edit-button').toggleClass('.change-color');
        const id = $(this).closest('.content').find('.content_id').val();
        $.ajax('/api/delete/task/', {
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify({id: id}),
            method: 'POST'
        })
        $(this).closest('.content').remove();
    });

    $(document).on('click', '.delete-user',function(){
        $(this).closest('.user').remove();
    });
    

    $(document).on('click',".btn-add-user",function(){

        $("#t-user").contents().clone().appendTo($(this).closest(".users").find(".users-block"));
    });
    
    $(document).on('dblclick','.content',function(){
        const title = $(this).find('.content-name').text();
        const description = $(this).find('.content_description').val();
        const task_id = $(this).find('.content_task_id').val();
        const users = $(this).find('.content_user_data').map(function(){
            const user = $(this);
            return {
                fname:user.find('.content_user_fname').val(),
                lname:user.find('.content_user_lname').val()};
        }).get();
        $(".modal.fade").modal('toggle');
        const task = $(this).data('task');
        $('.modal.fade').find(".modal-title").val(title).end()
        .find(".description").val(description).end()
        .find(".modal_task_id").val(task_id);

        const u = $('.modal.fade').find('.users-block');

        $('.modal.fade').find('.input-group.user').remove().end();

        users.forEach(user => add_user(u, user));
    
    });
    $(".btn.save-button").on('click', function(){
        
        const task_id = $(this).closest(".modal.fade").find('.modal_task_id').val();
        const title = $(this).closest(".modal.fade").find(".modal-title").val();
        const description = $(this).closest(".modal.fade").find(".description").val();
        const div = $(`.content_task_id[value = '${task_id}']`);
        div.closest(".content").find(".content-name").text(title);
        div.closest('.content').find('.content_description').val(description);

        const users = $('.users-block .user').map(function(){
            const user = $(this);
            return {
                fname:user.find('.firstname').val(),
                lname:user.find('.lastname').val()};
        }).get();

        div.closest('.content').find('.content_user_data').remove();
        users.forEach(user => create_user(div.closest('.content'), user));


        const task = {
            title: $(this).closest('.modal.fade').find('.modal-title').val(),
            description: $(this).closest('.modal.fade').find('.description').val(),
            stage: div.closest('.content').find('.content_stage').val(),
            task_id: parseInt(div.val()),
            users: users
        }
        if (div.closest('.content').find('.content_id').val() || div.closest('.content').find('.content_id').val() != "")
            task.id = div.closest('.content').find('.content_id').val();
        $.ajax('/api/set/', {
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(task),
            method: 'POST'
        }).done(function(value_id){
            console.log(value_id);
            div.closest('.content').find('.content_id').val(value_id).end();
        });
        $(this).closest(".modal.fade").modal('toggle');
    });
        
    $('.modal-title').on('change', function(){

    });

    $.getJSON('/api/', function(data) {
        data.stages.forEach(stage => create_column(stage));
    });
});

